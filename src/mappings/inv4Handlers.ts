import { SubstrateEvent } from "@subql/types";
import { IpSet, Asset } from "../types";
// import { Balance } from "@polkadot/types/interfaces";


// export async function handleBlock(block: SubstrateBlock): Promise<void> {
//     //Create a new Block with ID using block hash
//     let record = new Block(block.block.header.hash.toString());
//     //Record block number
//     record.blockNumber = block.block.header.number.toNumber();
//     record.timestamp = block.timestamp.toString();
//     record.parentHash = block.block.header.parentHash.toString();
//     record.stateRoot = block.block.header.stateRoot.toString();

//     logger.info(`\n\tBlock number: ${record.blockNumber}
// \tTimestamp: ${record.timestamp}
// \tParent Hash: ${record.parentHash}
// \tState root: ${record.stateRoot}\n`);

//     await record.save();
// }

export async function handleIPSCreated(event: SubstrateEvent): Promise<void> {
    const { event: { data: [account, ipsId, assets] }} = event;

    let record = new IpSet(ipsId.toString());
    record.timestamp = event.block.timestamp.toString();

    await record.save();

    // Maybe just to assets.toJSON() ?
    let assets_json = JSON.parse(assets.toString());

    // Update ownership for IP files passed as assets during IP set creation
    for (let i = 0; i < assets_json.length; i++) {
        let asset = assets_json[i];
        logger.info(`\t------------
        \tAsset ${i}: ${asset.ipfId}`)

        let ipf: Asset;

        if (asset.ipfId != undefined) {
            ipf = await Asset.get(asset.ipfId)
        }
        else if (asset.rmrkNftTuple != undefined) {
            ipf = await Asset.get(asset.rmrkNftTuple);

            if (!ipf) {
                ipf = new Asset(asset.rmrkNftTuple);
                ipf.type = "RmrkNft"
            }
        } 
        
        else if (asset.rmrkCollectionId != undefined) {
            ipf = await Asset.get(asset.rmrkCollectionId)

            if (!ipf) {
                ipf = new Asset(asset.rmrkCollectionId)
                ipf.type = "RmrkCollection"
            }
        }
        else {
            // Adding nested IP sets to to IP sets is not currently supported yet.
            ipf = new Asset("just to make error go away until nested IPS implemented");
        }

        // Update IP set membership
        ipf.ipSetId = ipsId.toString();

        // IP set is now owner of this IPF. The actual IPS accoundID is passed from
        // this event unlike some other events such as AppendedToIPS
        ipf.owner = account.toString();

        await ipf.save();
    }

    logger.info(`\n\tIP set created: ${record.id}
    \tCreated at timestamp: ${record.timestamp}\n`);
}

export async function handleAppendedToIPS(event: SubstrateEvent): Promise<void> {
    const { event: { data: [account, ipsId, metadata, assets] }} = event;
    
    let assets_json = JSON.parse(assets.toString());

    // Update ownership for IP files
    for (let i = 0; i < assets_json.length; i++) {
        let asset = assets_json[i];
        logger.info(`\t------------
        \tAsset ${i}: ${asset.ipfId}\n`)

        let ipf: Asset;

        if (asset.ipfId != undefined) {
            ipf = await Asset.get(asset.ipfId)
        }
        else if (asset.rmrkNftTuple != undefined) {
            ipf = await Asset.get(asset.rmrkNftTuple);

            if (!ipf) {
                ipf = new Asset(asset.rmrkNftTuple);
                ipf.type = "RmrkNft"
            }
        } 
        else if (asset.rmrkCollectionId != undefined) {
            ipf = await Asset.get(asset.rmrkCollectionId)

            if (!ipf) {
                ipf = new Asset(asset.rmrkCollectionId)
                ipf.type = "RmrkCollection"
            }
        }
        else {
            // Adding nested IP sets to to IP sets is not currently supported yet.
            ipf = new Asset("just to make error go away until nested IPS implemented");
        }

        // Update IP set membership
        ipf.ipSetId = ipsId.toString();

        // IP set is now owner of this IPF. I don't have access to the IPS account ID
        // or the derive_ips_account() func, so set owner as an empty string. Can derive owner from ipSet
        ipf.owner = null

        await ipf.save();
    }

    logger.info(`\n\tCalling account: ${account}
    \tIPS ID: ${ipsId}
    \tMetadata: ${metadata}
    \tAssets[0].toString() : ${assets[0].toString()}
    \tassets_json length : ${assets_json.length}\n`);
}

export async function handleRemovedFromIPS(event: SubstrateEvent): Promise<void> {
    const { event: { data: [account, ipsId, metadata, assets] }} = event;
    
    let assets_json = JSON.parse(assets.toString());

    // Update ownership for IP files
    for (let i = 0; i < assets_json.length; i++) {
        let asset = assets_json[i];
        let [id_obj, account] = asset;

        let id: string;

        if (id_obj.ipfId != undefined) id = id_obj.ipfId
        else if (id_obj.rmrkNftTuple != undefined) id = id_obj.rmrkNftTuple
        else if (id_obj.rmrkCollectionId != undefined) id = id_obj.rmrkCollectionId
        else id = "fake_id"

        logger.info(`---ID : ${id}`);

        let ipf = await Asset.get(id);
        
        // This ipf could have been removed from the IPS and sent to a users account so setting
        // this to an empty string is correct, but the IPF could also be removed to another IPS.
        // There is no way to know the ID of that IPS here so I leave it as blank
        // This data will not be perfect due to edge cases.
        ipf.ipSetId = null;
        ipf.owner = account.toString();

        await ipf.save();

        logger.info(`
        \t------------
        \tAsset ${i} : ${asset}
        \tAsset ID : ${id}
        \tNew owner : ${account}\n`);
    }
}

export async function handleAllowedReplica(event: SubstrateEvent): Promise<void> {
    const { event: { data: [ipsId] }} = event;

    let ips = await IpSet.get(ipsId.toString());
    ips.allowReplica = true;

    ips.save();
}

export async function handleDisallowedReplica(event: SubstrateEvent): Promise<void> {
    const { event: { data: [ipsId] }} = event;

    let ips = await IpSet.get(ipsId.toString());
    ips.allowReplica = false;

    ips.save();
}


// export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
//     const record = await Block.get(extrinsic.block.block.header.hash.toString());
//     //Date type timestamp
//     record.field4 = extrinsic.block.timestamp;
//     //Boolean tyep
//     record.field5 = true;
//     await record.save();
// }
