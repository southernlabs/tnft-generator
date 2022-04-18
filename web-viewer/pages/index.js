
import styles from '../styles/Home.module.css'
import React, { useState, Component,useEffect  } from 'react';
import Select from 'react-select'

import  Head  from 'next/head'
import { Grid, Center  } from '@mantine/core';

import { Prism } from '@mantine/prism';

export default function Home() {
  const [layers, setLayers] = useState([]);
  const [rawlayers, setrawlayers] = useState([]);


  const [meta, setMeta] = useState(``);


  const AllTraits = [
    {
        "name": "Hair",
        "traits":  ["hair1", "hair2", "hair3", "hair4"],
        "weights": [30, 20, 10, 40],
        "folder": "hair"
    },
    {
        "name": "Accessory",
        "traits":  ["accessory1", "accessory2", "accessory3", "accessory4"] ,
        "weights": [25, 25, 25, 25],
        "folder": "accessory"
    },
    {
        "name": "Face",
        "traits":  ["face1", "face2", "face3", "face4"],
        "weights": [25, 25, 25, 25],
        "folder": "face"
    },
    {
        "name": "Body",
        "traits":  ["Duck"],
        "weights": [100],
        "files": ["Duck"],
        "folder": "body"
    },
    {
        "name": "Background",
        "traits":  ["Green","Yellow","Blue","White"],
        "weights": [30, 10, 20, 40],
        "folder": "background"
    }
]

  const Hair =["hair1", "hair2", "hair3", "hair4"]
  const Accessory = ["accessory1", "accessory2", "accessory3", "accessory4"]
  const Face = ["face1", "face2", "face3", "face4"]
  const Body = ["Duck"]
  const Background = ["Green","Yellow","Blue","White"]

  
  const [selectedValue, setSelectedValue] = useState(3);

  const handleChange = (e,layer,layerN) => {
    const la = [...layers];
    const rlla = [...rawlayers];
    la[layerN] =  `/image-source/${layer}/${e.value}.png`
    rlla[layerN] = `${e.value}`
    
    setLayers( la )
    setrawlayers(rlla)
    getMeta()
    renderCanvas()
    getMeta()
  }

  const data = (f) => {
    const res = []
    f.map((n) => {
      res.push({
        value: n,
        label: n
      })
    });
    return res
  }

  useEffect(() => {
    updateLayers()
    renderCanvas()
    getMeta()
  }, []);

  const updateLayers = () => {
    setLayers([
      "/image-source/background/Green.png",
      "/image-source/body/Duck.png",
      "/image-source/face/face1.png",
      "/image-source/accessory/accessory1.png",
      "/image-source/hair/hair1.png"
    ])
    setrawlayers([
      "Green",
      "Duck",
      "face1",
      "accessory1",
      "hair1",
    ])
  }

  const getValueFromLayer= (layer) => {
    if(!layer)
    return ""
    var re = layer.match(/\/([a-zA-Z0-9_ ]*).png$/)
    console.log(re)
    if(re)
    return re[1]
  }

  const getMeta = () => {
    setMeta(`{
      "image": "http:/localhost:8080/token/0.jpg",
      "tokenId": 0,
      "name": "NFT 0",
      "attributes": [
          {
              "trait_type": "Hair",
              "value": "${getValueFromLayer(layers[4])}"
          },
          {
              "trait_type": "Accessory",
              "value": "${getValueFromLayer(layers[3])}"
          },
          {
              "trait_type": "Face",
              "value": "${getValueFromLayer(layers[2])}"
          },
          {
              "trait_type": "Body",
              "value": "${getValueFromLayer(layers[1])}"
          },
          {
            "trait_type": "Background",
            "value": "${getValueFromLayer(layers[0])}"
          }
      ]
  }`)
    
  }

  const renderCanvas = () => {
    console.log(layers)
    
  }

  return (
    <>
     
    <div className={styles.container}>
     

      <main className={styles.main}>
        <h1 className={styles.title}>
          NFT Generator
        </h1>

      <Grid style={{width: "100%"}}>
        <Grid.Col md={6} sm={12}>
          <Center>
            <div>
        <div className={styles.imagesHolder}>
          {layers.map( (l) => {
            return ( <img src={l} key={l} className={styles.img1} width={500} height={500}/> )

            //return (<div key={l} className="" style={{width:500, height:500, backgroundImage: `url(${l})` }}> </div>)
          })} 
        </div>
        <Prism language="json">{meta}</Prism>
        </div>
        </Center>
        </Grid.Col>

        <Grid.Col md={6} sm={12}>
        <div>
          <h3>Hair</h3>
          <Select
            placeholder="Select Option"
            value={data(Hair).find(obj => obj.value === selectedValue)} // set selected value
            options={data(Hair)} 
            onChange={e => handleChange(e,"hair",4)} 
          />
          <h3>Accessory</h3>
          <Select
            placeholder="Select Option"
            value={data(Accessory).find(obj => obj.value === selectedValue)} // set selected value
            options={data(Accessory)} 
            onChange={e => handleChange(e,"accessory",3)} 
          />
          <h3>Face</h3>
          <Select
            placeholder="Select Option"
            value={data(Face).find(obj => obj.value === selectedValue)} // set selected value
            options={data(Face)} 
            onChange={e => handleChange(e,"face",2)} 
          />
          <h3>Body</h3>
          <Select
            placeholder="Select Option"
            value={data(Body).find(obj => obj.value === selectedValue)} // set selected value
            options={data(Body)} 
            onChange={e => handleChange(e,"body",1)} 
          />
          <h3>Background</h3>
          <Select
            placeholder="Select Option"
            value={data(Background).find(obj => obj.value === selectedValue)} // set selected value
            options={data(Background)} 
            onChange={e => handleChange(e,"background",0)}
          />
        </div>
        </Grid.Col>
        </Grid>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://waifuston.com"
          target="_blank"
          rel="noreferrer"
        >
          Waifuston team
        </a>
      </footer>
    </div>
    </>
  )
}
