module delar::receipt;

use std::string::String;
use sui::clock::Clock;
use sui::event;

const ENotBuyer: u64 = 0;

public struct PurchaseReceipt has key {
    id: UID,
    product_id: ID,
    buyer: address,
    creator: address,
    product_title: String,
    blob_id: String,
    seal_id: vector<u8>,
    amount_paid: u64,
    affiliate: Option<address>,
    purchased_at: u64,
    download_count: u64,
}

public struct ReceiptMinted has copy, drop {
    receipt_id: ID,
    product_id: ID,
    buyer: address,
    creator: address,
    amount_paid: u64,
    affiliate: Option<address>,
    timestamp: u64,
}

public struct DownloadRecorded has copy, drop {
    receipt_id: ID,
    product_id: ID,
    buyer: address,
    download_count: u64,
    timestamp: u64,
}

public(package) fun mint_receipt(
    product_id: ID,
    creator: address,
    product_title: String,
    blob_id: String,
    seal_id: vector<u8>,
    amount_paid: u64,
    affiliate: Option<address>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let now = clock.timestamp_ms();
    let sender = ctx.sender();

    let receipt = PurchaseReceipt {
        id: object::new(ctx),
        product_id,
        buyer: sender,
        creator,
        product_title,
        blob_id,
        seal_id,
        amount_paid,
        affiliate,
        purchased_at: now,
        download_count: 0,
    };

    let receipt_id = object::id(&receipt);
    transfer::transfer(receipt, sender);

    event::emit(ReceiptMinted {
        receipt_id,
        product_id,
        buyer: sender,
        creator,
        amount_paid,
        affiliate,
        timestamp: now,
    });
}

public fun record_download(
    receipt: &mut PurchaseReceipt,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(ctx.sender() == receipt.buyer, ENotBuyer);
    receipt.download_count = receipt.download_count + 1;

    event::emit(DownloadRecorded {
        receipt_id: object::id(receipt),
        product_id: receipt.product_id,
        buyer: receipt.buyer,
        download_count: receipt.download_count,
        timestamp: clock.timestamp_ms(),
    });
}

public fun blob_id(receipt: &PurchaseReceipt): String { receipt.blob_id }

public fun seal_id(receipt: &PurchaseReceipt): vector<u8> { receipt.seal_id }

public fun buyer(receipt: &PurchaseReceipt): address { receipt.buyer }

public fun product_id(receipt: &PurchaseReceipt): ID { receipt.product_id }

public fun download_count(receipt: &PurchaseReceipt): u64 { receipt.download_count }
