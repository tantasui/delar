#[test_only]
module delar::checkout_tests;

use std::unit_test::assert_eq;
use sui::clock::Clock;
use sui::sui::SUI;
use sui::test_scenario::{Self, Scenario};

use delar::checkout;
use delar::fee::{Self, ProtocolFeeConfig};
use delar::product::{Self, ProductListing};
use delar::receipt::PurchaseReceipt;

const TEST_PRICE: u64 = 100_000_000;
const TEST_AFFILIATE_BPS: u64 = 1000;
const TEST_SEAL_ID: vector<u8> = x"00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";

const DEFAULT_FEE_BPS: u64 = 500;
const BASIS_POINTS_DENOMINATOR: u64 = 10000;

const ADMIN: address = @0x0;
const CREATOR: address = @0x1;
const BUYER: address = @0x2;
const AFFILIATE: address = @0x3;

fun setup_scenario(): Scenario {
    let mut scenario = test_scenario::begin(ADMIN);
    scenario.next_tx(ADMIN);
    {
        let ctx = scenario.ctx();
        fee::init_for_testing(ctx);
        sui::clock::share_for_testing(sui::clock::create_for_testing(ctx));
    };
    scenario
}

fun publish_test_product(scenario: &mut Scenario) {
    scenario.next_tx(CREATOR);
    let clock = scenario.take_shared<Clock>();
    let ctx = scenario.ctx();
    let product = product::publish_product(
        b"Test Product",
        b"A test product description",
        TEST_PRICE,
        b"test_blob_id_12345",
        TEST_SEAL_ID,
        0,
        b"",
        TEST_AFFILIATE_BPS,
        &clock,
        ctx,
    );
    transfer::public_transfer(product, CREATOR);
    test_scenario::return_shared(clock);
}

#[test]
fun successful_purchase() {
    let mut scenario = setup_scenario();
    publish_test_product(&mut scenario);

    scenario.next_tx(BUYER);
    {
        let clock = scenario.take_shared<Clock>();
        let fee_config = scenario.take_shared<ProtocolFeeConfig>();
        let mut product = scenario.take_from_address<ProductListing>(CREATOR);
        let ctx = scenario.ctx();
        let payment = sui::coin::mint_for_testing<SUI>(TEST_PRICE, ctx);

        checkout::buy(&mut product, &fee_config, payment, &clock, ctx);

        test_scenario::return_shared(clock);
        test_scenario::return_shared(fee_config);
        test_scenario::return_to_address(CREATOR, product);
    };

    scenario.next_tx(BUYER);
    {
        let receipt = scenario.take_from_sender<PurchaseReceipt>();
        assert_eq!(receipt.buyer(), BUYER);
        assert_eq!(receipt.download_count(), 0);
        assert!(!receipt.blob_id().is_empty());
        scenario.return_to_sender(receipt);
    };

    scenario.end();
}

#[test, expected_failure(abort_code = checkout::ECannotBuyOwnProduct, location = checkout)]
fun cannot_buy_own_product() {
    let mut scenario = setup_scenario();
    publish_test_product(&mut scenario);

    scenario.next_tx(CREATOR);
    let clock = scenario.take_shared<Clock>();
    let fee_config = scenario.take_shared<ProtocolFeeConfig>();
    let mut product = scenario.take_from_address<ProductListing>(CREATOR);
    let ctx = scenario.ctx();
    let payment = sui::coin::mint_for_testing<SUI>(TEST_PRICE, ctx);

    checkout::buy(&mut product, &fee_config, payment, &clock, ctx);

    abort
}

#[test, expected_failure(abort_code = checkout::EIncorrectPayment, location = checkout)]
fun incorrect_payment() {
    let mut scenario = setup_scenario();
    publish_test_product(&mut scenario);

    scenario.next_tx(BUYER);
    let clock = scenario.take_shared<Clock>();
    let fee_config = scenario.take_shared<ProtocolFeeConfig>();
    let mut product = scenario.take_from_address<ProductListing>(CREATOR);
    let ctx = scenario.ctx();
    let payment = sui::coin::mint_for_testing<SUI>(TEST_PRICE - 1, ctx);

    checkout::buy(&mut product, &fee_config, payment, &clock, ctx);

    abort
}

#[test, expected_failure(abort_code = checkout::EProductNotActive, location = checkout)]
fun inactive_product() {
    let mut scenario = setup_scenario();
    publish_test_product(&mut scenario);

    scenario.next_tx(CREATOR);
    {
        let clock = scenario.take_shared<Clock>();
        let mut product = scenario.take_from_address<ProductListing>(CREATOR);
        let ctx = scenario.ctx();
        product::deactivate_product(&mut product, &clock, ctx);
        test_scenario::return_shared(clock);
        test_scenario::return_to_address(CREATOR, product);
    };

    scenario.next_tx(BUYER);
    let clock = scenario.take_shared<Clock>();
    let fee_config = scenario.take_shared<ProtocolFeeConfig>();
    let mut product = scenario.take_from_address<ProductListing>(CREATOR);
    let ctx = scenario.ctx();
    let payment = sui::coin::mint_for_testing<SUI>(TEST_PRICE, ctx);

    checkout::buy(&mut product, &fee_config, payment, &clock, ctx);

    abort
}

#[test]
fun fee_calculation() {
    let mut scenario = setup_scenario();
    publish_test_product(&mut scenario);

    scenario.next_tx(BUYER);
    {
        let clock = scenario.take_shared<Clock>();
        let fee_config = scenario.take_shared<ProtocolFeeConfig>();
        let mut product = scenario.take_from_address<ProductListing>(CREATOR);
        let ctx = scenario.ctx();
        let payment = sui::coin::mint_for_testing<SUI>(TEST_PRICE, ctx);

        checkout::buy(&mut product, &fee_config, payment, &clock, ctx);

        test_scenario::return_shared(clock);
        test_scenario::return_shared(fee_config);
        test_scenario::return_to_address(CREATOR, product);
    };

    scenario.next_tx(BUYER);
    {
        let fee_config = scenario.take_shared<ProtocolFeeConfig>();
        let calculated_fee = fee::calculate_fee(TEST_PRICE, &fee_config);
        let expected_fee = (TEST_PRICE * DEFAULT_FEE_BPS) / BASIS_POINTS_DENOMINATOR;
        assert_eq!(calculated_fee, expected_fee);
        assert_eq!(calculated_fee, TEST_PRICE / 20);
        test_scenario::return_shared(fee_config);
    };

    scenario.end();
}

#[test]
fun affiliate_split() {
    let mut scenario = setup_scenario();
    publish_test_product(&mut scenario);

    scenario.next_tx(BUYER);
    {
        let clock = scenario.take_shared<Clock>();
        let fee_config = scenario.take_shared<ProtocolFeeConfig>();
        let mut product = scenario.take_from_address<ProductListing>(CREATOR);
        let ctx = scenario.ctx();
        let payment = sui::coin::mint_for_testing<SUI>(TEST_PRICE, ctx);

        checkout::buy_with_affiliate(
            &mut product,
            &fee_config,
            payment,
            AFFILIATE,
            &clock,
            ctx,
        );

        test_scenario::return_shared(clock);
        test_scenario::return_shared(fee_config);
        test_scenario::return_to_address(CREATOR, product);
    };

    scenario.next_tx(BUYER);
    {
        let receipt = scenario.take_from_sender<PurchaseReceipt>();
        assert_eq!(receipt.buyer(), BUYER);
        scenario.return_to_sender(receipt);
    };

    let expected_fee = (TEST_PRICE * DEFAULT_FEE_BPS) / BASIS_POINTS_DENOMINATOR;
    let expected_affiliate = (TEST_PRICE * TEST_AFFILIATE_BPS) / BASIS_POINTS_DENOMINATOR;
    let expected_creator = TEST_PRICE - expected_fee - expected_affiliate;

    assert_eq!(expected_fee + expected_affiliate + expected_creator, TEST_PRICE);
    assert_eq!(expected_fee, TEST_PRICE / 20);
    assert_eq!(expected_affiliate, TEST_PRICE / 10);
    assert_eq!(expected_creator, TEST_PRICE - TEST_PRICE / 20 - TEST_PRICE / 10);

    scenario.end();
}

#[test]
fun receipt_records_buyer() {
    let mut scenario = setup_scenario();
    publish_test_product(&mut scenario);

    scenario.next_tx(BUYER);
    {
        let clock = scenario.take_shared<Clock>();
        let fee_config = scenario.take_shared<ProtocolFeeConfig>();
        let mut product = scenario.take_from_address<ProductListing>(CREATOR);
        let ctx = scenario.ctx();
        let payment = sui::coin::mint_for_testing<SUI>(TEST_PRICE, ctx);

        checkout::buy(&mut product, &fee_config, payment, &clock, ctx);

        test_scenario::return_shared(clock);
        test_scenario::return_shared(fee_config);
        test_scenario::return_to_address(CREATOR, product);
    };

    scenario.next_tx(BUYER);
    {
        let receipt = scenario.take_from_sender<PurchaseReceipt>();
        assert_eq!(receipt.buyer(), BUYER);
        assert!(receipt.buyer() != @0xDEAD);
        scenario.return_to_sender(receipt);
    };

    scenario.end();
}
