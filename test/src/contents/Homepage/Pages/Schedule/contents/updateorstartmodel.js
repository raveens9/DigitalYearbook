import axios from "axios";
import { useState } from "react";

export const Updateorstart=(props)=>{
    const {day,time}=props;
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const[newtask,settask]=useState("");

    // Function to handle button click and toggle the popup state
    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };

    const send_data=async()=>{
        try {
            togglePopup();
            const sendingdata={"day":day,"time":time,"task":newtask};
            console.log('Sending data: ',sendingdata)

            await axios.post("http://localhost:8000/update",sendingdata)
            
            
        } catch (error) {
            console.log(error)
            
        }
    }

    return (
        <div className="flex flex-col gap-4 items-center justify-center my-7">
            <div className="flex flex-col justify-center items-center gap-0 ">
                <div className=" text-lg p-0 m-0">Do you want to change the Schedule</div>
                <div className=" text-lg p-0 m-0">or</div>
                <div className=" text-lg p-0 m-0">Start a class</div>
            </div>

            {/* Render buttons */}
            <div className="flex gap-4">
                {/* Button to update */}
                <div className="p-3 bg-blue-900 hover:bg-white hover:text-blue-900 font-semibold px-7 rounded-lg flex items-center justify-center hover:cursor-pointer" onClick={togglePopup}>
                    Update
                </div>

                {/* Button to start a class */}
                <div className="p-3 bg-blue-900 hover:bg-white hover:text-blue-900 font-semibold px-7 rounded-lg flex items-center justify-center hover:cursor-pointer">
                    Start a class
                </div>
            </div>

            {/* Conditional rendering of popup */}
            {isPopupOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center">
                    <div className=" bg-indigo-600 px-3 py-3 w-80 rounded-lg flex flex-col gap-2 justify-center items-center">
                        {/* Popup content */}
                        <h2 className=" text-xl font-semibold">Update</h2>
                        
                        <div className=" flex flex-row gap-2 p-1 justify-center items-center"> 
                            <div className="w-auto flex-1 font-semibold">New Task: </div><input type="text" placeholder="Enter new task" className="flex-1 p-2 text-gray-800" onChange={e=>{
                                
                                settask(e.target.value);
                                
                            }} onKeyDown={e=>{
                                if(e.keyCode==13){send_data()}
                            }}/>
                        </div>
                        <div>
                            <button className="p-3 bg-blue-900 hover:bg-white hover:text-blue-900 font-semibold px-7 rounded-lg flex items-center justify-center" onClick={send_data}>Submit</button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
    
