import '../App.css';
import React, { useState, useEffect } from 'react';

import TonContract from "../utils/ton-contract";

import pkgData from "../packages/Data.package";


export default function NftCard (props) {

    const [image, setImage] = useState("https://via.placeholder.com/128");
    const [id, setId] = useState(0);
    const [attributes, setMAttributes] = useState("");
 
    useEffect(() => {
      FetchMeta()
    });

    async function FetchMeta(){
      try {
        let __smcData = new TonContract({
          client: props.Client,
          name: "",
          tonPackage: pkgData,
          address: props.addrData,
        });
        //console.log(__smcData)
    
        let metadata = await __smcData.run({
          functionName: "getMeta"
        });
        console.log("Metadata", metadata);
        setImage(metadata.value.image)
        setId(parseInt(metadata.value.id, 16))

        let attr = await fetch(metadata.value.metadata)
        .then((response) => {
          return response.json();
        }).then((data) => {
          return data
        })
        setMAttributes(JSON.stringify(attr.attributes))
      } catch (error) {
        console.log("🟥",error)
        
      }
    }

    return(
    <div className="NFT-item">
        <div><img src={image}></img></div>
        <span style={{display:'inline'}}>#{id}</span>
        <br />
        <span style={{fontSize:'10px'}}>{attributes}</span>
        <br />
        <span style={{fontSize:'8px'}} className="card-text">{props.addrData}</span>
        
      </div>
    )
}