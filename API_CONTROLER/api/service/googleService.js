const googleUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
const axios = require('axios')

class GoogleMapsService{
    async getCoordinates (zipCode) {
        let coordinates = []
        await axios.get(googleUrl,{
            params:{
                address: zipCode,
                key: process.env.GOOGLE_API_KEY
            }
        }).then((response)=>{
            const data = response.data;
            coordinates = [
                data.results[0].geometry.location.lng,
                data.results[0].geometry.location.lat
            ];
        }).catch((error)=>{
            throw new Error(error)
        })
        return coordinates
    }
}

module.exports = GoogleMapsService;