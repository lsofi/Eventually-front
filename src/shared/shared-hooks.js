import axios from "axios";
import { useState } from "react";

export const useUploadForm = (url, config) => {
    const [isSuccess, setIsSuccess] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadForm = async (formData) => {
        setIsSuccess(false);
        let fdsize = 0;
        for(let pair of formData.entries()) {
            if (pair[1] instanceof Blob) 
            fdsize += pair[1].size;
            else
            fdsize += pair[1].length;
        }
        config.headers.size = fdsize; // buscar otro método
        const axiosconfig = {
            ...config,
            onUploadProgress: (progressEvent) => {
                const progress = (progressEvent.loaded / progressEvent.total) * 90;
                setProgress(progress);
            },
            onDownloadProgress: (progressEvent) => {
                const progress = 90 + (progressEvent.loaded / progressEvent.total) * 10;
                console.log(progress);
                setProgress(progress);
            }
        }
        console.log(axiosconfig)
        const res = await axios.post(url, formData, axiosconfig);
        await new Promise((resolve) => {
            setTimeout(() => resolve("success"), 100);
        });
        setIsSuccess(true);
        setProgress(0);
        return res
    };

    return { uploadForm, isSuccess, progress };
};