import { CircleX } from 'lucide-react';
import { useRef, useState } from 'react';
import { Updateorstart } from './updateorstartmodel';
import { Updateonlymodel } from './updateonlymodel';


export const Scheduleclickmodel=(props)=>{
    const {day,time,onClose}=props;


    //const [ontime,settime]=useState(false);
    let ontime=false;

    const modelref=useRef();

    const closemodel=(e)=>{
        if(modelref.current==e.target){
            onClose();
        }
    }


    
    
    

    function decide_class(){
        let vari=new Date();
        var cur_day=vari.getDay();
        var cur_hour=vari.getHours();

        if(day==cur_day && (time==cur_hour || time==(cur_hour-1))){
            ontime=true;
            
        }
    }


    decide_class();


    
    return(         

        <div ref={modelref} onClick={closemodel} className="fixed inset-0 w-screen h-screen bg-black bg-opacity-60 flex justify-center items-center  backdrop-blur-sm">
            <div className='flex flex-col gap-3 text-white justify-center items-center '>
                <div className=' place-self-end' onClick={onClose}><CircleX className='hover:cursor-pointer ' size={50}/></div>
                <div className=' bg-indigo-600 rounded-xl items-center '>
                    <div className=' w-96 h-auto flex flex-col items-center justify-center'>
                        {ontime?<Updateorstart day={day} time={time}/>:<Updateonlymodel day={day} time={time}/>}
                    </div>
                    
                    
                    
                </div>
            </div>
            
        </div>
    )
}