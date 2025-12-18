import { useState } from "react";

function Batching(){
    const [input, setInput] = useState("");
    const [batchSize, setBatchSize] = useState(10);
    const [batches, setBatches] = useState([]);
    const [copiedStatus, setCopiedStatus] = useState({}); // To track copied status of each batch

    const handleBatch=()=>{
        if(!input) return;
        const urls = input.split("\n").map(url => url.trim()).filter(url => url);
        const uniqueUrls = Array.from(new Set(urls));
        const bs = [];
        for(let i=0; i<uniqueUrls.length; i+=parseInt(batchSize)){
            bs.push(uniqueUrls.slice(i, i+parseInt(batchSize)));
        }
        setBatches(bs);
        console.log("Batches:", bs);
        alert(`Created ${bs.length} batches. Check console for details.`);
    }

    return(
        <div>
            <h4 className="text-center mt-3">Batching and Deduplication</h4>
            <div className="container">
                <div className="row mt-3">
                    <div className="col col-6 d-flex justify-content-center">
                        <div>

                        <textarea  value={input} rows={10} cols={40} onChange={(e)=>{setInput(e.target.value)}}></textarea>
                        <div className="d-flex">
                         <input type="number"  style={{width:"100px"}} value={batchSize} onChange={(e) => setBatchSize(e.target.value)} />   
                        <button className="btn btn-primary ms-auto me-0" onClick={handleBatch}>batch</button>
                        </div>
                       

                        </div>
                    </div>
                    <div className="col-6">
                         {batches.length <= 0 &&   <div>Data not found</div>}
                        {batches.length > 0 &&   batches.map((batch, index) => (
                            <div key={index} className="mb-3">
                                <h5>Batch {index + 1}:</h5>
                                <ul>
                                    <textarea name="" cols={40} id="" value={batch.join(",")} readOnly></textarea>
                                    <div className="d-flex justify-content-between">
                                        <button onClick={()=>{
                                            navigator.clipboard.writeText(batch.join(","));
                                            const newStatus = {...copiedStatus, [index]: true};
                                            setCopiedStatus(newStatus);

                                            console.log(copiedStatus);
                                            
                                            }}>copy</button>
                                        <div>{copiedStatus[index] ? <small className="text-success" >copied</small> : <small className="text-danger">not copied</small>}    </div>
                                        
                                    </div>
                                </ul>
                            </div>
                        ))}
                    </div>
                    
                </div>
            </div>
        </div>
    )
}
export default Batching;