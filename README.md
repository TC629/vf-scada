Introducción
============
Se diseñó un sistema “SCADA” que permite evaluar el desempeño de cada estación de la línea de embotellado en tiempo real desde un navegador.
Se colocan detectores de botellas en puntos específicos (en la entrada de cada estación) para detectar cuando una botella entra y sale de una estación. De esta forma, se puede determinar el tiempo promedio de una botella en el sistema y en cada estación.
Actualmente 

![Vista de la aplicación en funcionamiento](http://i.imgur.com/AW6n2I1.png)

Documentación
-------------
* [Manual](doc/manual.md)
* [Materiales](doc/materials.md)
* [¿Cómo configurar el pcDuino?](doc/pcduino.md)

Características
---------------
En ningún orden en particular:

* **Tiempo real**: se pueden observar los eventos en el momento que ocurren.
* **Sistema independiente**: no altera ningún mecanismo de la línea de producción.
* **Automatización de la toma de tiempos**: los operarios no tendrían que llevar bitácoras manuales.
* **Supervisión remota**: El supervisor puede evaluar la línea de producción desde la comodidad de su escritorio, su tableta o móvil.
* **Multiusuario**: muchos navegadores pueden abrir el programa y ver todos el mismo estado.
* **Extendible**: actualmente solo utiliza sensores, el en futuro se puede agregar funcionalidad para operar actuadores.

Instalación
===========
````bash
apt-get install nodejs
cd app
npm install
````

Uso
===
````bash
node app/app.js
````

Dependencias
============
* [Node.js](https://github.com/joyent/node)
* [Johnny-Five](https://github.com/rwaldron/johnny-five)
* [Socket.io](https://github.com/learnboost/socket.io)
* [Express](https://github.com/visionmedia/express)
* [Handlebars](https://github.com/wycats/handlebars.js/)
* [Snap.svg](https://github.com/adobe-webplatform/Snap.svg)
* [JQuery](https://github.com/jquery/jquery)

Autores
=======
Este trabajo es financiado e implementado bajo el programa [TC-629 (Aplicación de soluciones automatizadas o robóticas en MiPYMEs)](http://tcu.ucr.ac.cr/web/tcu).

Período 2013
------------
**Profesores coordinadores:**
* Eldon Caldwell
* Mauricio Zamora

**Estudiantes:**
* Sergio Brenes, [Escuela de Ingeniería Industrial](http://www.fing.ucr.ac.cr/)
* Jason Espinoza, [Escuela de Ingeniería Eléctrica](http://eie.ucr.ac.cr/)
* Luis Diego García, [Escuela de Computación](http://ecci.ucr.ac.cr/)
* Alina Rojas, [Escuela de Ingeniería Industrial](http://www.fing.ucr.ac.cr/)
* Joseph Mauricio Zamora, [Escuela de Ingeniería Industrial](http://www.fing.ucr.ac.cr/)
