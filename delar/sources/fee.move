module delar::fee;

const EFeeTooHigh: u64 = 1;

const MAX_FEE_BPS: u64 = 1000;
const DEFAULT_FEE_BPS: u64 = 500;
const BASIS_POINTS_DENOMINATOR: u64 = 10000;

public struct AdminCap has key, store {
    id: UID,
}

public struct ProtocolFeeConfig has key {
    id: UID,
    fee_bps: u64,
    fee_recipient: address,
}

fun init(ctx: &mut TxContext) {
    let admin = ctx.sender();
    transfer::share_object(ProtocolFeeConfig {
        id: object::new(ctx),
        fee_bps: DEFAULT_FEE_BPS,
        fee_recipient: admin,
    });
    transfer::transfer(AdminCap { id: object::new(ctx) }, admin);
}

public fun calculate_fee(amount: u64, config: &ProtocolFeeConfig): u64 {
    (amount * config.fee_bps) / BASIS_POINTS_DENOMINATOR
}

public fun fee_recipient(config: &ProtocolFeeConfig): address {
    config.fee_recipient
}

public fun fee_bps(config: &ProtocolFeeConfig): u64 {
    config.fee_bps
}

public fun update_fee(
    config: &mut ProtocolFeeConfig,
    _cap: &AdminCap,
    new_fee_bps: u64,
) {
    assert!(new_fee_bps <= MAX_FEE_BPS, EFeeTooHigh);
    config.fee_bps = new_fee_bps;
}

public fun update_recipient(
    config: &mut ProtocolFeeConfig,
    _cap: &AdminCap,
    new_recipient: address,
) {
    config.fee_recipient = new_recipient;
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx)
}
