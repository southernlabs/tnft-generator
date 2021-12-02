import { KeyPair, TonClient, signerKeys, signerNone } from "@tonclient/core";
import { createClient } from "@ton-contracts/utils/client";
import TonContract from "@ton-contracts/utils/ton-contract";
import { callThroughMultisig } from "@ton-contracts/utils/net";
import pkgSafeMultisigWallet from "../../../ton-packages/SetCodeMultisig.package"
import pkgNftRoot from "../ton-packages/NftRoot.package";
import pkgData from "../ton-packages/Data.package";
import pkgIndex from "../ton-packages/Index.package";
import pkgWrapper from "../ton-packages/Wrapper.package";
import pkgCryptoNeuralWaifu from "../ton-packages/CryptoNeuralWaifu.package";
import pkgCryptoWaifuWallet from "../ton-packages/CryptoWaifuWallet.package";
import { expect } from "chai";

describe("main test", () => {
  let client: TonClient;
  let smcSafeMultisigWallet: TonContract;
  let smcSafeMultisigWallet2: TonContract;
  let smcNftRoot: TonContract;
  let smcLegacy: TonContract;
  let smcLegacyWallet: TonContract;
  let smcNftRoot2: TonContract;
  let smcNft: TonContract;
  let smcWrapper: TonContract;
  let smcData: TonContract;
  let myDeployedNft = 0;
  let myNftRootAll = 0;
  let zeroAddress = '0:0000000000000000000000000000000000000000000000000000000000000000';
  let fakeAddress = "0:0000000000000000000000000000000000000000000000000000000000001111";
  let keys: KeyPair;
  let keysUser: KeyPair;

  before(async () => {
    client = createClient();
	//let msigKeys = await client.crypto.generate_random_sign_keys();
    smcSafeMultisigWallet = new TonContract({
      client,
      name: "SafeMultisigWallet",
      tonPackage: pkgSafeMultisigWallet,
      address: process.env.MULTISIG_ADDRESS,
      keys: {
        public: process.env.MULTISIG_PUBKEY,
        secret: process.env.MULTISIG_SECRET,
      },
    });
	
	// Semi-manual msig deploy, for test network
	if(!process.env.MULTISIG_ADDRESS){
		await smcSafeMultisigWallet.calcAddress();
		
		console.log(`Msig address: ${smcSafeMultisigWallet.address}`);
		//console.log(`Msig keys: `,msigKeys);
		
		let msigBalance = await smcSafeMultisigWallet.getBalance()
		console.log(`Msig balance: ${msigBalance}`);
		console.log(`Topup msig balance via tondev:  tondev ct -a ${smcSafeMultisigWallet.address} -v 1000000000000000`);
		//expect(msigBalance).not.to.be.equal(0);
		/*await smcSafeMultisigWallet.deploy({
		  input: {
			owners: ["0x2b036b4370ce5e893780a8418c4b7e038c5a1ad16ce9c7148696c3b03b353a4c"],
			reqConfirms: 1,
		  },
		});*/
		
	}

  keys = await client.crypto.generate_random_sign_keys();
  keysUser = await client.crypto.generate_random_sign_keys();

  //console.log(keys, keysUser)
	
  });

 /* it("deploy first NftRoot", async () => {
    smcNftRoot = new TonContract({
      client,
      name: "NftRoot",
      tonPackage: pkgNftRoot,
      keys,
    });
    
    await smcNftRoot.calcAddress();
    console.log("Root address : ",  smcNftRoot.address )
    await smcSafeMultisigWallet.call({
      functionName: "sendTransaction",
      input: {
        dest: smcNftRoot.address,
        value: 20_000_000_000,
        bounce: false,
        flags: 2,
        payload: "",
      }
    });

    console.log("Root Balance: ", await smcNftRoot.getBalance() )

    await smcNftRoot.deploy({
      input: {
        codeIndex: (
          await client.boc.get_code_from_tvc({ tvc: pkgIndex.image })
        ).code,
        codeData: (
          await client.boc.get_code_from_tvc({ tvc: pkgData.image })
        ).code
      },
    });

    console.log("Root Balance: ", await smcNftRoot.getBalance() )

    const res = (
      await client.net.query_collection({
        collection: "accounts",
        filter: {
          id: { eq: smcNftRoot.address },
        },
        result: "acc_type",
      })
    ).result[0];

    console.log("Root admin: ", (await smcNftRoot.run({functionName:"adminPubkey", input:{}}) ).value )

    expect(1).to.be.equal(res.acc_type);
  }); */

  it("deploy legacy Waifus contract", async () => {
    smcLegacy = new TonContract({
      client,
      name: "CryptoNeuralWaifu",
      tonPackage: pkgCryptoNeuralWaifu,
      keys,
    });

    await smcLegacy.calcAddress();

    console.log(`Legacy root address: ${smcLegacy.address}`)

    await smcSafeMultisigWallet.call({
      functionName: "sendTransaction",
      input: {dest: smcLegacy.address, value: 10_000_000_000,bounce: false,flags: 2,payload: "",},
    });

    await smcLegacy.deploy({ });

  });


  it("deploy Legacy user", async () => {
    smcLegacyWallet = new TonContract({
      client,
      name: "CryptoWaifuWallet",
      tonPackage: pkgCryptoWaifuWallet,
      keys: keysUser,
    });

    await smcLegacyWallet.calcAddress();
    await smcSafeMultisigWallet.call({
      functionName: "sendTransaction",
      input: {dest: smcLegacyWallet.address, value: 100_000_000_000,bounce: false,flags: 2,payload: "",},
    });

    await smcLegacyWallet.deploy({ input: {
      root: smcLegacy.address
    }, });

  });

  it("mint Legacy waifu FROM SafeMsig Wallet", async () => {

    console.log("Balance before mint: ", await smcSafeMultisigWallet.getBalance() )

    const payload = (await client.abi.encode_message_body({
        abi: {type: "Contract", value: pkgCryptoNeuralWaifu.abi},
        call_set: {
            function_name: "mint",
            input: {
              userKey: "0x"+process.env.MULTISIG_PUBKEY, 
            },
        },
        is_internal: true,
        signer: signerNone(),
    })).body;

    

    await smcSafeMultisigWallet.call({
      functionName: "sendTransaction",
      input: {dest: smcLegacy.address, value: 11_000_000_000,bounce: false,flags: 2,payload},
    });


    console.log("Balance: ", await smcSafeMultisigWallet.getBalance() )
    console.log( (await smcLegacy.run({ functionName: "getLatestWaifus", input: {N:2 } })).value );

    
  });
/*
  it("mint Legacy waifu", async () => {
    await smcLegacyWallet.call({
      functionName: "mintPrice",
      input: {userKey: "0x"+keysUser.public, value: 11_000_000_010},
    });

    await smcLegacyWallet.call({
      functionName: "mintPrice",
      input: {userKey: "0x"+keysUser.public, value: 11000000010},
    });

    console.log("Balance: ", await smcLegacyWallet.getBalance() )
    console.log( (await smcLegacy.run({ functionName: "getLatestWaifus", input: {N:3 } })).value );
    
  });

  it("register & configure Legacy wallet", async () => {
    await smcLegacyWallet.call({ functionName: "registerWallet", input: { wallet: smcLegacyWallet.address, fee: 2_000_000_000 }, keys: keysUser})

    //console.log( await smcLegacy.run({ functionName: "isWalletSetup", input: { } }) )
    
  });
*/
  

  


});

const getAddrData = async (
  client: TonClient,
  smcNftRoot: TonContract,
  smcSafeMultisigWallet: TonContract
): Promise<TonContract> => {
  let smcData: TonContract;
  const { codeHashData } = (
    await smcNftRoot.run({
      functionName: "resolveCodeHashData",
      input: {},
    })
  ).value;
  
  const Datas = (
    await client.net.query_collection({
      collection: "accounts",
      filter: {
        code_hash: { eq: codeHashData.slice(2) },
      },
      result: "id",
    })
  ).result;

  const promises = Datas.map((el) => {
    const _smcData = new TonContract({
      client,
      name: "",
      tonPackage: pkgData,
      address: el.id,
    });
    return _smcData.run({
      functionName: "getOwner",
    });
  });

  const results = await Promise.all(promises);

  results.forEach((el: any, i) => {
    if (el.value.addrOwner === smcSafeMultisigWallet.address) {
      smcData = new TonContract({
        client,
        name: "Data",
        tonPackage: pkgData,
        address: Datas[i].id,
      });
    }
  });

  return smcData;
};

const getMyNfts = async (
  client: TonClient,
  smcData: TonContract,
  rootAddr: string
): Promise<any> => {
  const { codeHashIndex } = (
    await smcData.run({
      functionName: "resolveCodeHashIndex",
      input: {
        addrRoot: rootAddr,
        addrOwner: process.env.MULTISIG_ADDRESS
      },
    })
  ).value;

  let nfts = [];
  let counter = 0;

  while (nfts.length === 0 && counter <= 500) {
    const qwe = await client.net.query_collection({
      collection: "accounts",
      filter: {
        code_hash: { eq: codeHashIndex.slice(2) },
      },
      result: "id",
    });
    counter++;
    nfts = qwe.result;
  }

  const promises = nfts.map((el) => {
    const _smcNft = new TonContract({
      client,
      name: "",
      tonPackage: pkgIndex,
      address: el.id,
    });
    return _smcNft.run({
      functionName: "getInfo",
    });
  });

  return await Promise.all(promises);
};
