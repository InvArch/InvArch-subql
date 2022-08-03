import { SubstrateExtrinsic,SubstrateEvent,SubstrateBlock } from "@subql/types";
import { Block, Created, Deleted, Appended, Removed } from "../types";
import { Balance } from "@polkadot/types/interfaces";


export async function handleBlock(block: SubstrateBlock): Promise<void> {
    //Create a new Block with ID using block hash
    let record = new Block(block.block.header.hash.toString());
    //Record block number
    record.number = block.block.header.number.toNumber();
    record.timestamp = block.timestamp.toString();
    record.parentHash = block.block.header.parentHash.toString();
    record.stateRoot = block.block.header.stateRoot.toString();

    logger.info(`\n\tBlock number: ${record.number}
\tTimestamp: ${record.timestamp}
\tParent Hash: ${record.parentHash}
\tState root: ${record.stateRoot}\n`);

    await record.save();
}

export async function handleCreated(event: SubstrateEvent): Promise<void> {
    const { event: { data: [account, IpsId] }} = event;
    // Create new event
    let record = new Created(`${event.block.block.header.hash.toString()}-${event.idx.toString()}`);
    record.account = account.toString();
    record.ipsId = IpsId.toString();

    logger.info(`\n\tEvent Index: ${event.idx}
    \tEvent Pallet: ${event.event.section}
    \tEvent: ${event.event.method}
    \tNew IPS Owner: ${account}
    \tNew IPS ID: ${IpsId}\n`);
    //Big integer type Balance of a transfer event
    // record.field3 = (balance as Balance).toBigInt();
    await record.save();
}

export async function handleDestroyed(event: SubstrateEvent): Promise<void> {
    const { event: { data: [account, IpsId] }} = event;
    // Create new event
    let record = new Deleted(`${event.block.block.header.hash.toString()}-${event.idx.toString()}`);
    record.account = account.toString();
    record.ipsId = IpsId.toString();

    logger.info(`\n\tEvent Index: ${event.idx}
    \tEvent Pallet: ${event.event.section}
    \tEvent: ${event.event.method}
    \tNew IPS Owner: ${account}
    \tNew IPS ID: ${IpsId}\n`);

    await record.save();
}

export async function handleAppended(event: SubstrateEvent): Promise<void> {
    const { event: { data: [account, IpsId, metadata, assets] }} = event;
    // Create new event
    let record = new Appended(`${event.block.block.header.hash.toString()}-${event.idx.toString()}`);
    record.account = account.toString();
    record.ipsId = IpsId.toString();
    record.metadata = metadata.toString();
    record.assets = assets.toString();

    logger.info(`\n\tEvent Index: ${event.idx}
    \tEvent Pallet: ${event.event.section}
    \tEvent: ${event.event.method}
    \tNew IPS Owner: ${account}
    \tNew IPS ID: ${IpsId}\n`);

    await record.save();
}

export async function handleRemoved(event: SubstrateEvent): Promise<void> {
    const { event: { data: [account, IpsId, metadata, assets] }} = event;
    // Create new event
    let record = new Removed(`${event.block.block.header.hash.toString()}-${event.idx.toString()}`);
    record.account = account.toString();
    record.ipsId = IpsId.toString();
    record.metadata = metadata.toString();
    record.assets = assets.toString();

    logger.info(`\n\tEvent Index: ${event.idx}
    \tEvent Pallet: ${event.event.section}
    \tEvent: ${event.event.method}
    \tNew IPS Owner: ${account}
    \tNew IPS ID: ${IpsId}\n`);

    await record.save();
}

// export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
//     const record = await Block.get(extrinsic.block.block.header.hash.toString());
//     //Date type timestamp
//     record.field4 = extrinsic.block.timestamp;
//     //Boolean tyep
//     record.field5 = true;
//     await record.save();
// }


handleRemoved