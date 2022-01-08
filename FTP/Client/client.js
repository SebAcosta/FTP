const {Socket} = require('net');
const fs = require('fs');
const path = require('path');
const readline = require('readline').createInterface({
    input:process.stdin,
    output:process.stdout,

});

var pathC = 'C:/Users/eabas/OneDrive/Documentos/Sebastián/Universidad/FTP/DatosClient'

const chat = (host, port) =>{
    const net = new Socket();
    net.connect({host, port});
    net.setEncoding("utf-8");

    net.on('connect', () =>{
        console.log("Escriba DECLARE para generar un path base");
    })
    net.on('data', (mensaje) =>{
        console.log(mensaje);
    })
    readline.on('line', (mensaje) =>{
        var txt = mensaje
        tokens = mensaje.split(' ');
        if (tokens[0] != 'LCD' && tokens[0] != 'GET' && tokens[0] != 'PUT' && tokens[0] != 'MGET' && tokens[0] != 'MPUT' && tokens[0] != 'DECLARE'){
            net.write(txt);
        }
        if(tokens[0] == 'CLOSE'){
            txt = 'CLOSE'
        }
        if(tokens[0] == 'LCD'){
            LCD();
        }  
        if (tokens[0] == 'GET'){
            GET(net);
        }
        if(tokens[0] == 'PUT'){
            PUT(net);
        }
        if (tokens[0] == 'MGET'){
            GET(net);
         }
        if(tokens[0] == 'MPUT'){
            MPUT(net);
        }
        if(tokens[0] == 'DECLARE'){
            DECLARE();
        }
    })
    net.on('close', () =>{
        console.log("Disconnected");
        process.exit(0);
    })
    net.on('error', (err) => {
        console.log(err);
    })
}

const main = () => {
    console.log("Bienvenido al servidor FTP")
    chat('localhost', 1090);
}

if (module === require.main){
    main();
}

function LCD(){
    if (tokens[1] != '...'){
        nuevo = pathC + '/' + tokens[1]
        if(fs.existsSync(nuevo)){
            pathC = nuevo
            }else{
            console.log("Error LCD: El archivo NO EXISTE!");
            }
    }else{
        let cantidad = pathC.split('/')
        let nuevoPath = ''
        let directorios = cantidad.length
        if (directorios > 9){
            for (i=0;i<directorios-1;i++){
                nuevoPath = nuevoPath + cantidad[i] + "/"
            }
            pathC = nuevoPath.slice(0,(nuevoPath.length)-1)
        }
    }
    console.log("Nuevo path: " + pathC)
}

function GET(net){
    let txtGet = tokens[0] + " " + tokens[1] + " " + pathC
    net.write(txtGet);
}

function PUT(net){
    let txtPUT = pathC + "/" + tokens[1]
    if (fs.existsSync(txtPUT)) {
        net.write("PUT " + txtPUT)
    }else{
        console.log("Error PUT: " + txtPUT + " no existe")
    }
}

function MPUT(net){
    let arrArch = tokens[1]
    let individual = arrArch.split(",")
    for (i=0;i<individual.length;i++){
        let txtMPUT = pathC + "/" + individual[i]
        if (fs.existsSync(txtMPUT)){
            net.write("MPUT " + txtMPUT)
        }else{
            console.log("Error MPUT: no existe " + txtMPUT)
        }
    }
}

function DECLARE(){
    if(tokens[1] == 'DEFAULT'){
        console.log("Path default")
    }else{
    if (fs.existsSync(tokens[1])){
        pathC = tokens[1]
        console.log("Path creado")
    }else{
        console.log("Path no encontrado")
    }
}
}