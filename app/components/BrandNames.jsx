import React from 'react'
import Heading from './Heading'
import { Link } from '@remix-run/react';

const BrandNames = ({ brandCollections = [] }) => {
    console.log("brandCollections from props:", brandCollections);
    
    // Group brands by first letter
    const groupBrandsByLetter = (brands) => {
        const groups = {};
        brands.forEach(brand => {
            const firstLetter = brand.title.charAt(0).toUpperCase();
            if (!groups[firstLetter]) {
                groups[firstLetter] = [];
            }
            groups[firstLetter].push(brand);
        });
        return groups;
    };

    // Create A-Z sections
    const createAlphabetSections = (brands) => {
        const groupedBrands = groupBrandsByLetter(brands);
        const sections = [
            { title: 'A-F', letters: ['A', 'B', 'C', 'D', 'E', 'F'] },
            { title: 'G-K', letters: ['G', 'H', 'I', 'J', 'K'] },
            { title: 'L-N', letters: ['L', 'M', 'N'] },
            { title: 'O-R', letters: ['O', 'P', 'Q', 'R'] },
            { title: 'S-Z', letters: ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] }
        ];

        return sections.map(section => {
            const sectionBrands = [];
            section.letters.forEach(letter => {
                if (groupedBrands[letter]) {
                    sectionBrands.push(...groupedBrands[letter]);
                }
            });

            return {
                ...section,
                brands: sectionBrands
            };
        });
    };

    const alphabetSections = createAlphabetSections(brandCollections);

    return (
        <div className='flex flex-col flex-wrap'>
            {alphabetSections.map((section, sectionIndex) => (
                <div key={section.title} className={sectionIndex > 0 ? 'mt-16' : ''}>
                    <h2 className='prata text-4xl lg:text-[3.542vw] lg:mb-[1.771vw] font-normal tracking-widest text-[#446184] text-left'>
                        {section.title}
                    </h2>
                    {section.brands.map((brand) => (
                        <Link to={`/brand/${brand.handle}`} key={brand.id}>
                            <p className='font-medium text-xl lg:text-[0.938vw] lg:leading-[2.083vw] tracking-[0.8px] uppercase'>
                                {brand.title}
                            </p>
                        </Link>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default BrandNames