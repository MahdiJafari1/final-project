const appId = "b6dea4178c9948bfbaa41ffbc62fd933";
const appCertificate = "1978f578c57b4e82be65408ed1a8a268";
const channelName = "meet";


let uid = sessionStorage.getItem('uid')
if(!uid){
    uid = String(Math.floor(Math.random() * 1000000))
    sessionStorage.setItem('uid', uid)
}
