const { formatEther } = require("ethers");
const ethers = require("ethers");
const nftperpABI = require("./nft-perp.json");
require("dotenv").config();

function createFilter(proTradersArray, ammArray) {
    let arr = [];
    //the hex value below represents the function signature of the event.
    arr.push('0x4c7b764f428c13bbea8cc8da90ebe6eef4dafeb27a4e3d9041d64208c47ca7c2');
    arr.push([]);
    arr.push([]);
    //padding zeros to the address before pushing it to the array,
    //because a topic requires 32bytes and an address is only 20bytes
    for (const proTrader of proTradersArray) {
        arr[1].push(`0x000000000000000000000000${proTrader.slice(2)}`);
    }
    for (const amm of ammArray) {
        arr[2].push(`0x000000000000000000000000${amm.slice(2)}`);
    }
    return arr;
}

async function main() {
    const nftPerpAddress = "0x1BBd56e80284B7064B44b2f4Bc494A268E614D36";
    const provider = new ethers.WebSocketProvider(
        `wss://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_WEBSOCKET}`
    );

    const contract = new ethers.Contract(nftPerpAddress, nftperpABI, provider);

    //the proTraders and amms array are filled with dummy data. 
    //As more amms are being added, the amms array should be updated to reflect new amms that a user is subscribed to.
    //same goes for the proTraders Array. As more proTraders join the platform and users subsribe to them, the array should be updated.
    //the arrays for both amms and proTraders can shrink in size depending on if users subscribes or unsubscribes from a particular protrader or amm.
    //NB: Amm here refers to NFT collections eg Azuki, BAYC
    let proTraders = [ '0x79d899379844d35a1a1f5d51d3185dd821f44dc1', '0xD97CCe4de34373065cE4EbF5F395904b07Bc86C9'];
    let amms = [ '0x92b96d53cead8f3e13bcee03f1d9691a50194d1a', 
                '0xac2eadb88d9e4eef34452943330f93e9a81de72d', 
                '0x70a1bee795a05f78a7185545c7e6a93d02442f5c', 
                '0x246a801c1905a8e0fce3aab6561966c8bfc3d7bf', 
                '0xe56472ddcc9100d933a3d9e1b59c1c63f9f83dd2'];

    const topicFilter = createFilter(proTraders, amms);

    contract.on(topicFilter, (event) => {

        //initializing the event data return variables 
        let trader, amm, margin, 
        exchangedPositionNotional, exchangedPositionSize, fee, 
        positionSizeAfter, realizedPnl, unrealizedPnlAfter, 
        badDebt, liquidationPenalty, markPrice, fundingPayment;
    
    
        //destructuring the array that contains the results of the event
        [
         trader, 
         amm, 
         margin, 
         exchangedPositionNotional, 
         exchangedPositionSize, 
         fee, 
         positionSizeAfter,  
         realizedPnl, 
         unrealizedPnlAfter,
         badDebt,
         liquidationPenalty,
         markPrice,
         fundingPayment]  = [...event.log.args];

    //logging the events as an object to improve readability
     console.log({
        trader: trader, 
        amm: amm, 
        margin: formatEther(margin), 
        exchangedPositionNotional: formatEther(exchangedPositionNotional),
        exchangedPositionSize: formatEther(exchangedPositionSize),
        fee: formatEther(fee),
        positionSizeAfter: formatEther(positionSizeAfter),
        realizedPnl: formatEther(realizedPnl),
        unrealizedPnlAfter: formatEther(unrealizedPnlAfter),
        badDebt: formatEther(badDebt),
        liquidationPenalty: formatEther(liquidationPenalty),
        markPrice: formatEther(markPrice),
        fundingPayment: formatEther(fundingPayment)
     });
    });

}


main();
