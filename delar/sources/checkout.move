module delar::checkout;

use sui::clock::Clock;
use sui::coin::Coin;
use sui::event;

use delar::fee::{Self, ProtocolFeeConfig};
use delar::product::{Self, ProductListing};
use delar::receipt;

const EProductNotActive: u64 = 0;
const EIncorrectPayment: u64 = 1;
const ECannotBuyOwnProduct: u64 = 2;

const BASIS_POINTS_DENOMINATOR: u64 = 10000;

public struct PurchaseCompleted has copy, drop {
    product_id: ID,
    buyer: address,
    creator: address,
    amount_paid: u64,
    fee_amount: u64,
    affiliate: Option<address>,
    affiliate_amount: u64,
    timestamp: u64,
}

public fun buy<T>(
    product: &mut ProductListing,
    fee_config: &ProtocolFeeConfig,
    payment: Coin<T>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    buy_internal(product, fee_config, payment, option::none(), clock, ctx);
}

public fun buy_with_affiliate<T>(
    product: &mut ProductListing,
    fee_config: &ProtocolFeeConfig,
    payment: Coin<T>,
    affiliate: address,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    buy_internal(product, fee_config, payment, option::some(affiliate), clock, ctx);
}

fun buy_internal<T>(
    product: &mut ProductListing,
    fee_config: &ProtocolFeeConfig,
    mut payment: Coin<T>,
    affiliate: Option<address>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(product.is_active(), EProductNotActive);
    assert!(ctx.sender() != product.creator(), ECannotBuyOwnProduct);

    let price = product.price_usdc();
    assert!(payment.value() == price, EIncorrectPayment);

    let fee_amount = fee::calculate_fee(price, fee_config);
    let affiliate_bps = product.affiliate_bps();
    let affiliate_amount = if (affiliate.is_some() && affiliate_bps > 0) {
        (price * affiliate_bps) / BASIS_POINTS_DENOMINATOR
    } else {
        0
    };

    let fee_coin = payment.split(fee_amount, ctx);
    transfer::public_transfer(fee_coin, fee::fee_recipient(fee_config));

    if (affiliate_amount > 0) {
        let affiliate_coin = payment.split(affiliate_amount, ctx);
        transfer::public_transfer(affiliate_coin, *affiliate.borrow());
    };

    transfer::public_transfer(payment, product.creator());

    product::increment_sales(product);

    receipt::mint_receipt(
        product.product_id(),
        product.creator(),
        product.title(),
        product.blob_id(),
        product.seal_id(),
        price,
        affiliate,
        clock,
        ctx,
    );

    event::emit(PurchaseCompleted {
        product_id: product.product_id(),
        buyer: ctx.sender(),
        creator: product.creator(),
        amount_paid: price,
        fee_amount,
        affiliate,
        affiliate_amount,
        timestamp: clock.timestamp_ms(),
    });
}
