import './App.css';
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import { TonClient } from '@tonclient/core';
import { libWeb } from '@tonclient/lib-web';

import TonContract from "./utils/ton-contract";

// Packages 
// Just steal them from builded tnft-core and replace .ts with .js
import pkgSafeMultisigWallet from "./packages/SetCodeMultisig.package"
import pkgNftRoot from "./packages/NftRoot.package";
import pkgData from "./packages/Data.package";
import pkgIndex from "./packages/Index.package";
import pkgMinter from "./packages/Minter.package";

import { callThroughMultisig } from "./utils/net";

import  NftCard from "./components/NftCard";

// Get config which we got after collection deployment
import CONFIG from "./test-deploy-result.json";

function App() {
  TonClient.useBinaryLibrary(libWeb);
  const client = new TonClient({
      network: { 
          endpoints: ['127.0.0.1'] 
      } 
  });

  const [addrRoot, setAddrRoot] = useState(CONFIG.Root.address);
  const [addrMsig, setAddrMsig] = useState(CONFIG.Msig.address);
  const [addrMinter, setAddrMinter] = useState(CONFIG.Minter.address);
  const [msigKeys, setMsigKeys] = useState(CONFIG.Msig.keys)
  const [smcNftRoot, setSmcNftRoot] = useState({});
  const [smcMinter, setSmcMinter] = useState({});
  const [smcSafeMultisigWallet, setSmcSafeMultisigWallet] = useState({});

  const [myNfts, setMyNfts] = useState([]);

  
  async function setMsigAddress(event) {
    setAddrMsig(event.target.value)
  }
  async function setRootAddress(event) {
    setAddrRoot(event.target.value)
  }
  async function setMinterAddress(event) {
    setAddrMinter(event.target.value)
  }

  const Mint = async () => {
    // Get msig wallet
    let msig = new TonContract({
        client,
        name: "SafeMultisigWallet",
        tonPackage: pkgSafeMultisigWallet,
        address: addrMsig,
        keys: msigKeys,
    });
    console.log(msig, await msig.getBalance())
    // Mint
    try {
      let m = await callThroughMultisig({
        client,
        smcSafeMultisigWallet: msig,
        abi: pkgMinter.abi,
        functionName: "mintNft",
        input: {},
        dest: addrMinter,
        value: 2_500_000_000,
      });
      console.log("🐋", m)
      toast.success('Minted')
      FetchNFTs()
    } catch (error) {
      toast.error("Error")
    }
    
  }

  const FetchNFTs = async () => {
    let NftRoot = new TonContract({
      client,
      name: "NftRoot",
      address: addrRoot,
      tonPackage: pkgNftRoot,
    });
 
    setSmcNftRoot(smcNftRoot)
    //console.log(NftRoot)
    let _smcData = await getAddrData(
      client,
      NftRoot,
      addrMsig
    );
    let my = []
    console.log(_smcData)
    if(_smcData){
      my = await getMyNfts(client, _smcData ,addrRoot, addrMsig)
    }else{
      toast.error("You don't have any NFT")
    }
  
    setMyNfts(my)
  }

  useEffect(() => {
    if(CONFIG.Default){
      toast.error(`You running on default 'test-deploy-result.json'. Please refer to documentation. 
      Deploy your collection and then copy 'test-deploy-result.json' file after deployment to ./src directory (replace the default one)`,{
        duration: 600000,
      })
    }
    //FetchNFTs()
  });

  return (
    <div className="App">
      <Toaster position="top-right"/>
      <input placeholder="Collection root address" value={addrRoot} onChange={setRootAddress}></input>
      <input placeholder="User msig address" value={addrMsig} onChange={setMsigAddress}></input>
      <br />
      <input placeholder="Minter address" value={addrMinter} onChange={setMinterAddress}></input>
      <br /><br />
      {smcMinter != {} &&
      <button onClick={Mint}>🚀 MINT!</button>
      }
      <br /><br />
      <button onClick={FetchNFTs}>📁 Fetch NFTs</button>
      <div className="grid-holder">
        <div className="NFTs">
          {myNfts.map((object, i) => 
          <div key={i}>
            <NftCard addrData={object.value.addrData} Client={client} />
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

const getAddrData = async (
  client,
  smcNftRoot,
  msigAdress
)=> {
  let smcData;
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

  results.forEach((el, i) => {
    if (el.value.addrOwner === msigAdress) {
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
  client,
  smcData,
  rootAddr,
  msigAddress
) => {
  const { codeHashIndex } = (
    await smcData.run({
      functionName: "resolveCodeHashIndex",
      input: {
        addrRoot: rootAddr,
        addrOwner: msigAddress
      },
    })
  ).value;

  //console.log("codeHashIndex", codeHashIndex)

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
