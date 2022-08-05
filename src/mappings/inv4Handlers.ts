import { SubstrateExtrinsic,SubstrateEvent,SubstrateBlock } from "@subql/types";
import { Block, IpSet, IpFile } from "../types";
import { Balance } from "@polkadot/types/interfaces";


export async function handleBlock(block: SubstrateBlock): Promise<void> {
    //Create a new Block with ID using block hash
    let record = new Block(block.block.header.hash.toString());
    //Record block number
    record.blockNumber = block.block.header.number.toNumber();
    record.timestamp = block.timestamp.toString();
    record.parentHash = block.block.header.parentHash.toString();
    record.stateRoot = block.block.header.stateRoot.toString();

    logger.info(`\n\tBlock number: ${record.blockNumber}
\tTimestamp: ${record.timestamp}
\tParent Hash: ${record.parentHash}
\tState root: ${record.stateRoot}\n`);

    await record.save();
}

export async function handleIPSCreated(event: SubstrateEvent): Promise<void> {
    const { event: { data: [account, ipsId, assets] }} = event;

    let record = new IpSet(ipsId.toString());
    record.timestamp = event.block.timestamp.toString();

    await record.save();

    let assets_json = JSON.parse(assets.toString());

    // Update ownership for IP files passed as assets during IP set creation
    for (let i = 0; i < assets_json.length; i++) {
        let asset = assets_json[i];
        logger.info(`\t------------
        \tAsset ${i}: ${asset.ipfId}`)

        let ipf = await IpFile.get(asset.ipfId);

        // Update IP set membership
        ipf.ipSetId = ipsId.toString();

        // IP set is now owner of this IPF. The actual IPS accoundID is passed from
        // this event unlike some other events
        ipf.owner = account.toString();

        await ipf.save();
    }

    logger.info(`\n\tIP set created: ${record.id}
    \tCreated at timestamp: ${record.timestamp}\n`);
}

export async function handleMinted(event: SubstrateEvent): Promise<void> {
    const { event: { data: [account, ipfId, ipfsHash] }} = event;
    // Create new event
    let record = new IpFile(ipfId.toString());
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

export async function handleAppendedToIPS(event: SubstrateEvent): Promise<void> {
    const { event: { data: [account, ipsId, metadata, assets] }} = event;
    
    let assets_json = JSON.parse(assets.toString());

    // Update ownership for IP files
    for (let i = 0; i < assets_json.length; i++) {
        let asset = assets_json[i];
        logger.info(`\t------------
        \tAsset ${i}: ${asset.ipfId}`)

        let ipf = await IpFile.get(asset.ipfId);

        // Update IP set membership
        ipf.ipSetId = ipsId.toString();

        // IP set is now owner of this IPF. I don't have access to the IPS account ID
        // or the derive_ips_account() func, so set owner as an empty string. Can derive owner from ipSet
        ipf.owner = ""

        await ipf.save();
    }

    logger.info(`\n\tCalling account: ${account}
    \tIPS ID: ${ipsId}
    \tMetadata: ${metadata}
    \tAssets[0].toString() : ${assets[0].toString()}
    \tassets_json length : ${assets_json.length}\n`);
    //Big integer type Balance of a transfer event
    // record.field3 = (balance as Balance).toBigInt();
    // await record.save();
}


// export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
//     const record = await Block.get(extrinsic.block.block.header.hash.toString());
//     //Date type timestamp
//     record.field4 = extrinsic.block.timestamp;
//     //Boolean tyep
//     record.field5 = true;
//     await record.save();
// }
