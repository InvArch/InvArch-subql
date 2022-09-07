import { SubstrateEvent } from "@subql/types";
import { IpSet, Asset } from "../types";

export async function handleMinted(event: SubstrateEvent): Promise<void> {
    const { event: { data: [account, ipfId, ipfsHash] }} = event;
    // Create IPF
    let record = new Asset(ipfId.toString());
    // Will need Minted event to include type. Hardcoding for now
    record.type = "IPF"
    record.owner = account.toString();
    // File just minted, so owner is the same as author
    record.author = account.toString();
    record.ipfsHash = ipfsHash.toString();
    record.timestamp = event.block.timestamp.toString();

    logger.info(`\n\tIP file created: ${record.id}
    \tAuthor: ${record.author}
    \tIPFS hash: ${record.ipfsHash}
    \tCreated at timestamp: ${record.timestamp}\n`);
    //Big integer type Balance of a transfer event
    // record.field3 = (balance as Balance).toBigInt();
    await record.save();
}

export async function handleBurned(event: SubstrateEvent): Promise<void> {
    const { event: { data: [account, ipfId] }} = event;

    logger.info("\nBefore IPF removal...");

    // Delete IPF record
    await Asset.remove(ipfId.toString());

    logger.info(`After IPF ${ipfId} removed...`);
}
