
export function getUrl(link){
	if(link.includes('http')){
		return link ;
	}
	else{
		return `https://stackoverflow.com/${link}`;
	}
}
