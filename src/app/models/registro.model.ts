export class Registro {
    public formato: string;
    public text: string;
    public type: string;
    public icon: string;
    public created: Date;

    constructor(formato: string, text: string){
        this.formato = formato;
        this.text = text;
        this.created = new Date();
        this.determinarTipo();
    }

    private determinarTipo(){
        const inicioTexto = this.text.substring(0, 4);
        console.log('Tipo: ',inicioTexto);
        
        switch ( inicioTexto ) {
            case 'http':
                this.type = 'http';
                this.icon = 'globe';
                break;
            case 'geo:':
                this.type = 'geo';
                this.icon = 'pin';
                break;
        
            default:
                this.type = 'No reconocido';
                this.icon = 'create';
                break;
        }
    }


}