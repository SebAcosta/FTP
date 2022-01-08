const net = require('net');
const fs = require('fs');
const Path = require('path');
const readline = require('readline').createInterface({
    input:process.stdin,
    output:process.stdout,

});

var pathS = 'C:/Users/eabas/OneDrive/Documentos/Sebastián/Universidad/FTP/DatosServer';
var pathBase = "D";

function generaPath(){
    console.log("Ingrese el path base (no podrá regresar carpetas anteriores")
    readline.on('line', (mensaje) =>{
        if(mensaje != 'DEFAULT'){
            if (fs.existsSync(mensaje)){
                pathBase = mensaje
                pathS = pathBase
                console.log("Path creado")
                console.log("Listo para leer peticiones")
                readline.close();
            }else{
                throw console.error("Error, path server no encontrado");
            }
        }else{
            console.log("Default path")
            console.log("Listo para leer peticiones")
            readline.close();
        }
    })
}

function inicio(socket){
    socket.on('data', data => {
        peticion = data.toString('utf-8');

        tokens = peticion.split(' ');

        if(tokens[0] == 'GET'){
            console.log("GET")
            GET(socket)
        }else if(tokens[0] == 'PUT'){
            console.log('PUT')
            PUT(socket)
        }else if(tokens[0] == 'LCD'){

        }else if(tokens[0] == 'CD'){
            CD(socket)
            msg = 'Nueva carpeta server: ' + pathS
            console.log("CD")
            console.log(msg)
        }else if(tokens[0] == 'LS'){
            console.log("LS")
            LS(socket)
        }else if(tokens[0] == 'DELETE'){
            console.log(tokens[0])
            DELETE(socket)
        }else if(tokens[0] == 'MPUT'){
            console.log("MPUT")
            MPUT(socket)
        }else if(tokens[0] == 'MGET'){
            console.log("MGET")
            MGET(socket)
        }else if(tokens[0] == 'RMDIR'){
            console.log(tokens[0])
            RMDIR(socket)
        }else if(tokens[0] == 'PWD'){
            console.log(tokens[0])
            msg = 'Directorio: ' + pathS
            socket.write(msg)
            console.log(msg)
        }else if(tokens[0] == 'CLOSE'){
            console.log(tokens[0])
            socket.end();
            if (pathBase != 'D')
            pathS = pathBase
        }
        else if(tokens[0] == 'DECLARE'){

        }else{
            msg = 'Escriba un comando correcto'
            socket.write(msg)
            console.log(msg)
        }
    })
    socket.on('close', () =>{
        console.log("Se cerro la conexión del cliente");
    })
    socket.on('error', (err) =>{
        console.log(err);
        process.exit(0);
    })
}

const server = net.createServer(socket => {
    inicio(socket);
}).on('close', () =>{
    console.log("Conexión cerrada");
    server.end();
}).on('error', err => {
    console.log("HAY UN ERROR");
    throw err;
})

server.listen(1090, 'localhost', () => {
    console.log('Active Server!');
    generaPath();
});

function CD(socket){
    if (tokens[1] != '...'){
        nuevo = pathS + '/' + tokens[1]
        if(fs.existsSync(nuevo)){
            pathS = nuevo
            }else{
            console.log("Error CD: El archivo NO EXISTE!");
            socket.write("Error CD: El archivo no existe")
            }
    }else{
        let cantidad = pathS.split('/')
        let nuevoPath = ''
        let directorios = cantidad.length
        if (directorios > 9){
            for (i=0;i<directorios-1;i++){
                nuevoPath = nuevoPath + cantidad[i] + "/"
            }
            pathS = nuevoPath.slice(0,(nuevoPath.length)-1)
        }
    }
    socket.write('Nueva carpeta del server: ' + pathS)
}

function LS(socket){
    if(fs.existsSync(pathS)){
        fs.readdir(pathS,(error,files) =>{
            if (error){
                throw error
            }
            let archivos = files.toString()
            let arch = archivos.slice(",")
            if (arch.length == 0){
                console.log("Carpeta vacía")
                socket.write("Carpeta vacía")
            }else{
                socket.write(files.toString())
                console.log(files.toString())
            }
        })
        }else{
        console.log("Error LS: El archivo NO EXISTE!")
        socket.write("Error LS: El archivo no existe")
        }
}

function RMDIR(socket){
    if(fs.existsSync((pathS + "/" + tokens[1]))){
        fs.readdir((pathS + "/" + tokens[1]),(error,files) =>{
            if (error){
                throw error
            }
            let archivos = files.toString()
            let arch = archivos.slice(",")
            if (arch.length == 0){
                fs.rmdirSync((pathS + "/" + tokens[1]))
                console.log("Carpeta vacía, eliminado" + tokens[1])
                socket.write("Carpeta vacía, eliminado " + tokens[1])
            }else{
                console.log("Error RMDIR: Carpeta no vacía")
                socket.write("Error RMDIR: Carpeta no vacía")
            }
        })
        }else{
        console.log("Error RMDIR: El directorio NO EXISTE!");
        socket.write("Error RMDIR: El directorio NO EXISTE!")
        }
}

function DELETE(socket){
    if (tokens[1] == "-R"){
        deleteFolderRecursive((pathS + "/" + tokens[2]),socket)
    }else{
        if(fs.existsSync(pathS + "/" + tokens[1])){
            fs.unlinkSync((pathS + "/" + tokens[1]),(error) =>{
                if (error){
                    throw error
                }
            })
            console.log("Borrado " + tokens[1]);
            socket.write("Borrado " + tokens[1])
        }else{
            console.log("Error DELET: El archivo NO EXISTE!");
            socket.write("Error DELETE: El archivo NO EXISTE!")
        }
    }
}

const deleteFolderRecursive = function(path,socket) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach((file, index) => {
        const curPath = Path.join(path, file);
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
      console.log("Archivos y carpeta borrados")
      socket.write("Archivos y carpeta borrados")
    }else{
        console.log("Error DELETE: El path NO EXISTE!");
        socket.write("Error DELETE: El path NO EXISTE!");
    }
  };

function GET(socket){
    if (fs.existsSync(pathS + "/" + tokens[1])) {
        pathClient = tokens[2]
        archivo = pathS + "/" + tokens[1]
        copyFile(archivo, pathClient, socket)
    }else{
        console.log("Error GET: " + pathS + "/" + tokens[1] + " no existe")
        socket.write("Error GET: " + pathS + "/" + tokens[1] + " no existe")
    }
}

function PUT(socket){
    console.log("File: " + tokens[1] + " dir2: " + pathS)
    copyFile(tokens[1],pathS,socket)
}

var copyFile = (file, dir2, socket)=>{
    //gets file name and adds it to dir2
    var f = Path.basename(file);
    var source = fs.createReadStream(file);
    var dest = fs.createWriteStream(Path.resolve(dir2, f));
  
    source.pipe(dest);
    source.on('end', function() { console.log('Copiado ' + file + "!"); 
    socket.write('Copiado ' + file + "!")});
    source.on('error', function(err) { console.log(err); 
    socket.write("Error: " + err)});
  };

function MGET(socket){
    let arrArch = tokens[1]
    let individual = arrArch.split(",") 
    for(i=0;i<individual.length;i++){
        let currFile = individual[i]
        if (fs.existsSync(pathS + "/" + currFile)) {
            pathClient = tokens[2]
            archivo = pathS + "/" + currFile
            copyFile(archivo, pathClient, socket)
        }else{
            console.log("Error MGET: " + pathS + "/" + currFile + " no existe")
            socket.write("Error MGET: " + pathS + "/" + currFile + " no existe")
        }
    }
}

function MPUT(socket){
    copyFile(tokens[1],pathS,socket)
}