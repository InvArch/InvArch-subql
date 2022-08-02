import { SubstrateExtrinsic,SubstrateEvent,SubstrateBlock } from "@subql/types";
import { Block } from "../types";
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

// export async function handleEvent(event: SubstrateEvent): Promise<void> {
//     const {event: {data: [account, balance]}} = event;
//     //Retrieve the record by its ID
//     const record = await Block.get(event.block.block.header.hash.toString());
//     record.timestamp = account.toString();
//     //Big integer type Balance of a transfer event
//     record.field3 = (balance as Balance).toBigInt();
//     await record.save();
// }

// export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
//     const record = await Block.get(extrinsic.block.block.header.hash.toString());
//     //Date type timestamp
//     record.field4 = extrinsic.block.timestamp;
//     //Boolean tyep
//     record.field5 = true;
//     await record.save();
// }


