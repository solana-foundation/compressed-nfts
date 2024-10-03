import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";
import {
  getAssetWithProof,
  mplBubblegum,
  transfer,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  keypairIdentity,
  publicKey as UMIPublicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from "@metaplex-foundation/umi/serializers";
import {
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { clusterApiUrl } from "@solana/web3.js";

const umi = createUmi(clusterApiUrl("devnet"));

// load keypair from local file system
// See https://github.com/solana-developers/helpers?tab=readme-ov-file#get-a-keypair-from-a-keypair-file
const localKeypair = await getKeypairFromFile();

// convert to Umi compatible keypair
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(localKeypair.secretKey);

// load the MPL Bubblegum program, dasApi plugin and assign a signer to our umi instance
umi.use(keypairIdentity(umiKeypair)).use(mplBubblegum()).use(dasApi());

const assetId = UMIPublicKey("D4A8TYkKE5NzkqBQ4mPybgFbAUDN53fwJ64b8HwEEuUS");

//@ts-ignore
const assetWithProof = await getAssetWithProof(umi, assetId);

let uintSig = await (
  await transfer(umi, {
    ...assetWithProof,
    leafOwner: umi.identity.publicKey,
    newLeafOwner: UMIPublicKey("J63YroB8AwjDVjKuxjcYFKypVM3aBeQrfrVmNBxfmThB"),
  }).sendAndConfirm(umi)
).signature;

const b64sig = base58.deserialize(uintSig);

let explorerLink = getExplorerLink("transaction", b64sig, "devnet");
console.log(`explorer link: ${explorerLink}`);
console.log("✅ Finished successfully!");
