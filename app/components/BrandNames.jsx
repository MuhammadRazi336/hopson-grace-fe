import React from 'react'
import Heading from './Heading'
import { Link } from '@remix-run/react';

const BrandNames = ({ brandCollections = [] }) => {
    console.log("brandCollections from props:", brandCollections);
  return (
    <div className='flex flex-col flex-wrap'>
        <div>
            <h2 className='prata text-4xl lg:text-7xl font-normal tracking-widest text-[#446184] text-left'>A-F</h2>
            {brandCollections.map((collection) => (
                <Link to={`/brand/${collection.handle}`} key={collection.id}>
                    <p className='font-medium text-xl uppercase' key={collection.id}>{collection.title}</p>
                </Link>
            ))}
            {/* <p className='font-medium text-xl'>ADDISON ROSS</p>
            <p className='font-medium text-xl'>ALESSI</p>
            <p className='font-medium text-xl'>ALLCLAD</p>
            <p className='font-medium text-xl'>ANNA NEWYORK</p>
            <p className='font-medium text-xl'>ARCHIVIST GALLERY</p>
            <p className='font-medium text-xl'>BAOBAB COLLECTION</p>
            <p className='font-medium text-xl'>BAREFOOT DREAMS</p>
            <p className='font-medium text-xl'>BEE-HIVE HANDMADE</p>
            <p className='font-medium text-xl'>BELLE-V</p>
            <p className='font-medium text-xl'>BERARD</p>
            <p className='font-medium text-xl'>BREVILLE</p>
            <p className='font-medium text-xl'>BRITISH COLOR STANDARD</p>
            <p className='font-medium text-xl'>CHARIVET EDITIONS</p>
            <p className='font-medium text-xl'>COSTA NOVA</p>
            <p className='font-medium text-xl'>CUTIPOL</p>
            <p className='font-medium text-xl'>DAVID FUSSINEGGER</p>
            <p className='font-medium text-xl'>DAVID MELLOR</p>
            <p className='font-medium text-xl'>DIDI JOHNSTON</p>
            <p className='font-medium text-xl'>DIBBURN</p>
            <p className='font-medium text-xl'>DINOSAUR DESIGNS</p>
            <p className='font-medium text-xl'>DUALIT</p>
            <p className='font-medium text-xl'>DURALEX</p> */}
        </div>
{/* 
        <div className='mt-16'>
            <h2 className='prata text-4xl lg:text-7xl font-normal tracking-widest text-[#446184] text-left'>G-K</h2>
            <p className='font-medium text-xl'>GINORI 1735</p>
            <p className='font-medium text-xl'>GOLDIE HOME</p>
            <p className='font-medium text-xl'>GRY & SIF</p>
            <p className='font-medium text-xl'>HAM</p>
            <p className='font-medium text-xl'>HENRY HANDWORK</p>
            <p className='font-medium text-xl'>HOPSON GRACE</p>
            <p className='font-medium text-xl'>HOPTIMIST</p>
            <p className='font-medium text-xl'>ICHENDORF MILANO</p>
            <p className='font-medium text-xl'>IMNI LIFESTYLE</p>
            <p className='font-medium text-xl'>JARS</p>
            <p className='font-medium text-xl'>KITCHENAID</p>
        </div>

        <div className='mt-16'>
            <h2 className='prata text-4xl lg:text-7xl font-normal tracking-widest text-[#446184] text-left'>L-N</h2>
            <p className='font-medium text-base lg:text-xl'>L’INDOCHINEAUR</p>
            <p className='font-medium text-base lg:text-xl'>LA ROCHERE</p>
            <p className='font-medium text-base lg:text-xl'>LAURA STODDART</p>
            <p className='font-medium text-base lg:text-xl'>LES STORTS</p>
            <p className='font-medium text-base lg:text-xl'>LIND DNA</p>
            <p className='font-medium text-base lg:text-xl'>LINEN WAY</p>
            <p className='font-medium text-base lg:text-xl'>LSA INTERNATIONAL</p>
            <p className='font-medium text-base lg:text-xl'>MARIMEKKO</p>
            <p className='font-medium text-base lg:text-xl'>MATOUK</p>
            <p className='font-medium text-base lg:text-xl'>MONTES DOGGETT</p>
            <p className='font-medium text-base lg:text-xl'>MUD AUSTRALIA</p>
            <p className='font-medium text-base lg:text-xl'>MURPHY & DAUGHTERS</p> 
        </div>

        <div className='mt-16'>
            <h2 className='prata text-4xl lg:text-7xl font-normal tracking-widest text-[#446184] text-left'>O-R</h2>
            <p className='font-medium text-base lg:text-xl'>OPINEL</p>
            <p className='font-medium text-base lg:text-xl'>PAMPA BAY</p>
            <p className='font-medium text-base lg:text-xl'>PAVIOT</p>
            <p className='font-medium text-base lg:text-xl'>PENGUIN RANDOM HOUSE</p>
            <p className='font-medium text-base lg:text-xl'>PEUGEOT</p>
            <p className='font-medium text-base lg:text-xl'>PRINTWORKS</p>
            <p className='font-medium text-base lg:text-xl'>RAINCOAST BOOKS</p>
            <p className='font-medium text-base lg:text-xl'>RICHARD BRENDAN</p>
            <p className='font-medium text-base lg:text-xl'>ROBBE & BERKING</p>
        </div>

        <div className='mt-16'>
            <h2 className='prata text-4xl lg:text-7xl font-normal tracking-widest text-[#446184] text-left'>S-Z</h2>
            <p className='font-medium text-base lg:text-xl'>SABRE PARIS</p>
            <p className='font-medium text-base lg:text-xl'>SEL SAINT LAURENT</p>
            <p className='font-medium text-base lg:text-xl'>SKEPPSHULT</p>
            <p className='font-medium text-base lg:text-xl'>SMEG</p>
            <p className='font-medium text-base lg:text-xl'>STAUB</p>
            <p className='font-medium text-base lg:text-xl'>SUPERGLAS BY KOZIOL</p>
            <p className='font-medium text-base lg:text-xl'>TANTALUS DESIGN</p>
            <p className='font-medium text-base lg:text-xl'>THE HAGGADAH COLLECTIVE</p>
            <p className='font-medium text-base lg:text-xl'>TOM DIXON</p>
            <p className='font-medium text-base lg:text-xl'>UASHMAMA</p>
            <p className='font-medium text-base lg:text-xl'>VIETRI</p>
            <p className='font-medium text-base lg:text-xl'>VISKI</p>
            <p className='font-medium text-base lg:text-xl'>VITAMIX</p>
            <p className='font-medium text-base lg:text-xl'>WILLIAM YEOWARD</p>
            <p className='font-medium text-base lg:text-xl'>WONKI WARE</p>
            <p className='font-medium text-base lg:text-xl'>ZALTO</p>
        </div> */}
    </div>
  )
}

export default BrandNames