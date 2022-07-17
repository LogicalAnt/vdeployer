

# vdeployer: Vtecx framework deploy manager

![vdeployer](https://img.shields.io/badge/vdeployer-deploy%20manager-brightgreen)
![Vtecx](https://img.shields.io/badge/Vtecx-BaaS-blue)

vdeployer is a CLI tool that can deploy files from vtecx project which needs to be deployed. 
While working with the vtecx framework, developers had to share which server script files they have changed, so that others can compile and deploy the changes. **Vdeployer** focused to mitigate the problem.

# Installation
`npm i -g vdeployer`

# Usage

## Show script files and uploaded/synced status
```console
$ vdeployer l
```

| #   | File Name       | Synced |
| --- | --------------- | ------ |
| 1   | hello-world.tsx | ✔      |
| 2   | save-file.tsx   | ✖      |

```console
$ vdeployer l --date
```
| #   | File Name       | Synced | Date Modified          | Date Uploaded          |
| --- | --------------- | ------ | ---------------------- | ---------------------- |
| 1   | hello-world.tsx | ✔      | 16-07-2022 12:48:58 PM | 16-07-2022 14:13:02 PM |
| 2   | save-file.tsx   | ✖      | 16-07-2022 22:49:41 PM | 16-07-2022 22:40:52 PM |



https://user-images.githubusercontent.com/16508504/179388160-834987a0-3735-41ac-a67b-d26ea02951c4.mov



## Upload all the unsynced files
```console
$ vdeployer d
```
```console
(   ●  ) Deploying...  
http://vdeployer-test.vte.cx/server/create_site.js?_content&_bulk&_async
asset ./server/create_site.js 20.9 KiB [compared for emit] [minimized] (name: main)
./src/server/create_site.tsx 194 bytes [built] [code generated]
./node_modules/vtecxapi/index.js 47.5 KiB [built] [code generated]
webpack 5.73.0 compiled successfully in 8179 ms
dist/server/create_site.js --> http://vdeployer-test.vte.cx/server/create_site.js
```


https://user-images.githubusercontent.com/16508504/179388256-ea812e9c-4305-403a-bb3f-9cce43b313a8.mov



## Create script files
```console
$ vdeployer c -f create_talkroom
```
This will create  `src/server/create_talkroom.tsx` in your vtecx project directory and add the deployment command to the `deploy.sh` file

`src/server/create_talkroom.tsx`
```javascript
import * as vtecxapi from 'vtecxapi'
    
try {
    vtecxapi.doResponse(200)
} catch (error) {
    vtecxapi.log(error)
}
```

`deploy.sh`
```sh
#!/bin/sh
npx vtecxutil upload
...
...
npx webpack --env entry=/server/create_talkroom.tsx --mode=production --env externals=false
```


https://user-images.githubusercontent.com/16508504/179388276-e1be373a-df88-46ae-a0ab-2db7d826b61d.mov


