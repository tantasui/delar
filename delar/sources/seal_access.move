module delar::seal_access;

use delar::receipt::PurchaseReceipt;

const ENoAccess: u64 = 1;

entry fun seal_approve(
    id: vector<u8>,
    receipt: &PurchaseReceipt,
    ctx: &TxContext,
) {
    assert!(receipt.buyer() == ctx.sender(), ENoAccess);
    assert!(id_ends_with(id, receipt.seal_id()), ENoAccess);
}

fun id_ends_with(id: vector<u8>, suffix: vector<u8>): bool {
    let id_len = id.length();
    let suffix_len = suffix.length();
    if (suffix_len > id_len) return false;

    let offset = id_len - suffix_len;
    let mut i = 0;
    while (i < suffix_len) {
        if (id[offset + i] != suffix[i]) return false;
        i = i + 1;
    };
    true
}
