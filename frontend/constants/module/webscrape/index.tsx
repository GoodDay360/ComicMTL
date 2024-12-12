
class WebScrape {
    private scraper:any;

    constructor(source: string) {  // Constructor
        this.scraper = this.source_control(source);
        return this.scraper
    }
    
    private source_control(source:string){
        const AVAILABLE_SOURCES:any = {
            DrakeComic: require("./DrakeComic"),
        }
        return AVAILABLE_SOURCES[source];
    }

    public get_list(...arg:any){
        return this.scraper.get_list(...arg);
    }
}


export default WebScrape;