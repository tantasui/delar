module delar::product;

use std::string::String;
use sui::clock::Clock;
use sui::event;
use sui::vec_set::{Self, VecSet};

const ENotCreator: u64 = 0;
const EInvalidProductType: u64 = 1;
const EPriceTooLow: u64 = 2;
const EEmptyBlobId: u64 = 3;
const EInvalidSealId: u64 = 4;
const EAffiliateAlreadyAdded: u64 = 5;
const EAffiliateNotFound: u64 = 6;

const MIN_PRICE: u64 = 10000;
const PRODUCT_TYPE_COUNT: u8 = 6;
const SEAL_ID_LEN: u64 = 32;

public struct ProductListing has key, store {
    id: UID,
    creator: address,
    title: String,
    description: String,
    price_usdc: u64,
    blob_id: String,
    seal_id: vector<u8>,
    product_type: u8,
    thumbnail_blob_id: String,
    is_active: bool,
    total_sales: u64,
    affiliate_bps: u64,
    affiliates: VecSet<address>,
    created_at: u64,
    updated_at: u64,
}

public struct ProductPublished has copy, drop {
    product_id: ID,
    creator: address,
    title: String,
    price_usdc: u64,
    timestamp: u64,
}

public struct ProductUpdated has copy, drop {
    product_id: ID,
    title: String,
    price_usdc: u64,
    timestamp: u64,
}

public struct ProductDeactivated has copy, drop {
    product_id: ID,
    is_active: bool,
    timestamp: u64,
}

public struct AffiliateAdded has copy, drop {
    product_id: ID,
    affiliate: address,
    timestamp: u64,
}

public struct AffiliateRemoved has copy, drop {
    product_id: ID,
    affiliate: address,
    timestamp: u64,
}

public fun publish_product(
    title: vector<u8>,
    description: vector<u8>,
    price_usdc: u64,
    blob_id: vector<u8>,
    seal_id: vector<u8>,
    product_type: u8,
    thumbnail_blob_id: vector<u8>,
    affiliate_bps: u64,
    clock: &Clock,
    ctx: &mut TxContext,
): ProductListing {
    assert!(price_usdc >= MIN_PRICE, EPriceTooLow);
    assert!(!blob_id.is_empty(), EEmptyBlobId);
    assert!(seal_id.length() == SEAL_ID_LEN, EInvalidSealId);
    assert!(product_type < PRODUCT_TYPE_COUNT, EInvalidProductType);

    let now = clock.timestamp_ms();
    let sender = ctx.sender();
    let title_str = title.to_string();

    let product = ProductListing {
        id: object::new(ctx),
        creator: sender,
        title: title_str,
        description: description.to_string(),
        price_usdc,
        blob_id: blob_id.to_string(),
        seal_id,
        product_type,
        thumbnail_blob_id: thumbnail_blob_id.to_string(),
        is_active: true,
        total_sales: 0,
        affiliate_bps,
        affiliates: vec_set::empty(),
        created_at: now,
        updated_at: now,
    };

    event::emit(ProductPublished {
        product_id: object::id(&product),
        creator: sender,
        title: title_str,
        price_usdc,
        timestamp: now,
    });

    product
}

public fun add_affiliate(
    product: &mut ProductListing,
    affiliate: address,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(ctx.sender() == product.creator, ENotCreator);
    assert!(!product.affiliates.contains(&affiliate), EAffiliateAlreadyAdded);
    product.affiliates.insert(affiliate);

    event::emit(AffiliateAdded {
        product_id: object::id(product),
        affiliate,
        timestamp: clock.timestamp_ms(),
    });
}

public fun remove_affiliate(
    product: &mut ProductListing,
    affiliate: address,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(ctx.sender() == product.creator, ENotCreator);
    assert!(product.affiliates.contains(&affiliate), EAffiliateNotFound);
    product.affiliates.remove(&affiliate);

    event::emit(AffiliateRemoved {
        product_id: object::id(product),
        affiliate,
        timestamp: clock.timestamp_ms(),
    });
}

public fun update_product(
    product: &mut ProductListing,
    title: vector<u8>,
    description: vector<u8>,
    price_usdc: u64,
    thumbnail_blob_id: vector<u8>,
    affiliate_bps: u64,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(ctx.sender() == product.creator, ENotCreator);
    assert!(price_usdc >= MIN_PRICE, EPriceTooLow);

    let now = clock.timestamp_ms();
    let title_str = title.to_string();

    product.title = title_str;
    product.description = description.to_string();
    product.price_usdc = price_usdc;
    product.thumbnail_blob_id = thumbnail_blob_id.to_string();
    product.affiliate_bps = affiliate_bps;
    product.updated_at = now;

    event::emit(ProductUpdated {
        product_id: object::id(product),
        title: title_str,
        price_usdc,
        timestamp: now,
    });
}

public fun deactivate_product(
    product: &mut ProductListing,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(ctx.sender() == product.creator, ENotCreator);
    let now = clock.timestamp_ms();
    product.is_active = false;
    product.updated_at = now;

    event::emit(ProductDeactivated {
        product_id: object::id(product),
        is_active: false,
        timestamp: now,
    });
}

public fun reactivate_product(
    product: &mut ProductListing,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(ctx.sender() == product.creator, ENotCreator);
    let now = clock.timestamp_ms();
    product.is_active = true;
    product.updated_at = now;

    event::emit(ProductDeactivated {
        product_id: object::id(product),
        is_active: true,
        timestamp: now,
    });
}

public fun is_approved_affiliate(product: &ProductListing, affiliate: address): bool {
    product.affiliates.contains(&affiliate)
}

public fun blob_id(product: &ProductListing): String { product.blob_id }

public fun seal_id(product: &ProductListing): vector<u8> { product.seal_id }

public fun price_usdc(product: &ProductListing): u64 { product.price_usdc }

public fun creator(product: &ProductListing): address { product.creator }

public fun is_active(product: &ProductListing): bool { product.is_active }

public fun affiliate_bps(product: &ProductListing): u64 { product.affiliate_bps }

public fun product_id(product: &ProductListing): ID { object::id(product) }

public fun title(product: &ProductListing): String { product.title }

public fun product_type(product: &ProductListing): u8 { product.product_type }

public(package) fun increment_sales(product: &mut ProductListing) {
    product.total_sales = product.total_sales + 1;
}
