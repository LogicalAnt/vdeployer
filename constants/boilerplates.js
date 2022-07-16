export const bareboneScript = `
import * as vtecxapi from 'vtecxapi'
    
try {
    vtecxapi.doResponse(200)
} catch (error) {
    vtecxapi.log(error)
}
`.trim()
