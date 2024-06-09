import { useEffect, useState } from "react"

export const Homepage_menu=()=>{
    const[mode,setmode]=useState(false);
    useEffect(()=>{
        console.log("Current mode: ",mode)
    },[mode])
    return(
        <div className={mode && "dark"}>
            <div className=' text-gray-800  h-screen  sm:w-56 md:w-56 lg:w-72 font-extrabold flex flex-col bg-gray-400 dark:text-gray-400 dark:bg-gray-800'>
                <div className=" flex flex-1 border-8  border-gray-700 my-2 rounded-3xl hover:cursor-pointer mx-4 justify-center items-center text-3xl text-red-500 dark:text-yellow-500" onClick={()=>{setmode(!mode)}}>Schedule</div>
                <div className=" flex flex-1  border-8  border-gray-700 my-2 rounded-3xl hover:cursor-pointer mx-4 justify-center items-center text-3xl text-red-500 dark:text-yellow-500" onClick={()=>{setmode(!mode)}}>Start Class</div>
                <div className=" flex flex-1  border-8  border-gray-700 my-2 rounded-3xl hover:cursor-pointer mx-4 justify-center items-center text-3xl text-red-500 dark:text-yellow-500" onClick={()=>{setmode(!mode)}}>History</div>
                <div className=" flex flex-1  border-8  border-gray-700 my-2 rounded-3xl hover:cursor-pointer mx-4 justify-center items-center text-3xl text-red-500 dark:text-yellow-500" onClick={()=>{setmode(!mode)}}>Settings</div>
                <div className=" flex flex-1  border-8  border-gray-700 my-2 rounded-3xl hover:cursor-pointer mx-4 justify-center items-center text-3xl text-red-500 dark:text-yellow-500" onClick={()=>{setmode(!mode)}}>Aboutus</div>
                
                
                
            </div>
            
           
            
        </div>
    )
}