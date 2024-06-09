import React from 'react';
import { Homepage_navbar } from '../contents/Homepage/Homepage_navbar';
import { Homepage_menu } from '../contents/Homepage/Homepage_menu';
import { Scedule } from '../contents/Homepage/Pages/Schedule/Schedule_page';


export const Homepage=()=>{
    return(
        <div>
            
            <Homepage_navbar/>
            <div className='flex'>
                
                <div className='lg:w-72 sm:w-56 md:w-56 h-auto flex-grow-0'>
                    <Homepage_menu className="h-auto" />
                </div>
                <div className=' my-2 w-screen overflow-y-scroll '>
                    <Scedule/>
                </div>

            </div>
            
        </div>
    )
}