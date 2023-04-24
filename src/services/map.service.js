import axios from "axios";
const axiosApi = axios.create();

export const getCoordinates = async (address) => {
    let coordinates;
    try{
        const {province, city} = await getCityAndProvnice(address);
        const addressString = `${address.street}+${address.number},+${city},+$${province},+${address.country}`;
        const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
        const addressRes = await axiosApi.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${addressString}&result_type=street_address&key=${decodeURI(apiKey).trim()}`)
        const results = addressRes.data.results;
        if (!results || !results.length) return;
        coordinates = results[0].geometry.location;
    } catch (error) {
        console.log(error)
    }
    return coordinates;
}

export const getCityAndProvnice = async (address) => {
    try{
        const municipioRes = await axiosApi.get(`https://apis.datos.gob.ar/georef/api/municipios?id=${address.city}`);

        const res = {
            province: municipioRes.data.municipios[0].provincia.nombre,
            city: municipioRes.data.municipios[0].nombre
        }
        return res;
    } catch (error) {return {province: '', city: ''}}
}

export const getAddressAll = async (latLng) => {
    const latLngString = `${latLng.lat},${latLng.lng}`;
    try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
        const addressResPromise =  axiosApi.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latLngString}&key=${decodeURI(apiKey).trim()}&result_type=street_address`);
        const addressArgResPromise =  axiosApi.get(`https://apis.datos.gob.ar/georef/api/ubicacion?lat=${latLng.lat}&lon=${latLng.lng}`);
        
        const addressRes = await addressResPromise;
        const addressArgRes = await addressArgResPromise;

        const results = addressRes.data.results;
        const resultGob = addressArgRes.data.ubicacion;
        const address = {
            city: resultGob.municipio.id,
            province: resultGob.provincia.id,
            country: 'Argentina',
            street: '',
            number: 0
        }
        if( results && results.length) {
            results.forEach((result)=>{
                if (result.types.includes('street_address')){
                    const address_string = result.formatted_address.split(',')[0]
                    const address_string_arr = address_string.split(' ');
                    const { street, number } = getStreetAndNumber(address_string_arr);
                    address.street = street;
                    address.number = number;
                }
            })
        }
        address.coordinates = JSON.stringify(latLng);
        return address;
    } catch (error) {}
}

export const getAddressGoogle = async (latLng) =>{
    const latLngString = `${latLng.lat},${latLng.lng}`;
    const address = {}
    try{
        const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
        const addressRes = await axiosApi.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latLngString}&key=${decodeURI(apiKey).trim()}`);
        const results = addressRes.data.results;
        results.forEach((result)=>{
            if (result.types.includes('street_address')){
                address.street = result.formatted_address.split(',')[0];
            }
            if (result.types.includes('administrative_area_level_1')){
                address.country = result.formatted_address.split(',')[1];
                address.province = result.formatted_address.split(',')[0];
            }
            if (result.types.includes('locality')){
                address.city = result.formatted_address.split(',')[0];
            }
        })
    } catch (error){}
    return address;
}

export const getAddressArg = async (latLng) =>{
    const address = {};
    try{
        const addressArgRes = await axiosApi.get(`https://apis.datos.gob.ar/georef/api/ubicacion?lat=${latLng.lat}&lon=${latLng.lng}`);
        const result = addressArgRes.data.ubicacion;
        address.city = result.municipio.id;
        address.province = result.provincia.id;
        address.country = 'Argentina';
        address.street = '';
        address.number = 0;
    } catch (error){}
    return address;
}

export const getStreetAndNumber = ( address_string_arr ) => {
    let street = '';
    let number = '';
    for (let i = 0; i < address_string_arr.length; i++) {
        if (i < address_string_arr.length - 1) street += street? ` ${address_string_arr[i]}`: `${address_string_arr[i]}`;
        else number = address_string_arr[i];
    }
    return {
        street: street,
        number: number
    };
}