const express = require('express');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.json());

// Función para cargar datos desde un archivo JSON específico
const cargarEmpleados = () => {
    try {
        // Lee el archivo "Empleados.json" y convierte su contenido JSON a un objeto en JavaScript
        return JSON.parse(fs.readFileSync('Empleados.json'));
    } catch (error) {
        // Si hay un error al leer el archivo (como si no existe o tiene formato incorrecto),
        // imprime un mensaje de error y devuelve un array vacío
        console.error('Error al leer el json', error);
        return [];
    }
};

const cargarDesarrolloHumano = () => {
    try {
        return JSON.parse(fs.readFileSync('desarrolloHumano.json'));
    } catch (error) {
        console.error('Error al leer el json', error);
        return [];
    }
};

const cargarLicencias = () => {
    try {
        return JSON.parse(fs.readFileSync('Licencias.json'));
    } catch (error) {
        console.error('Error al leer el json', error);
        return [];
    }
};

const cargarDepartamentos = () => {
    try {
        return JSON.parse(fs.readFileSync('departamentos.json'));
    } catch (error) {
        console.error('Error al leer el json', error);
        return [];
    }
};

const cargarReclutamiento = () => {
    try {
        return JSON.parse(fs.readFileSync('reclutamiento.json'));
    } catch (error) {
        console.error('Error al leer el json', error);
        return [];
    }
};

const cargarPuestos = () => {
    try {
        return JSON.parse(fs.readFileSync('puestos.json'));
    } catch (error) {
        console.error('Error al leer el json', error);
        return [];
    }
};


// Endpoint para obtener una lista de datos del archivo JSON y enviarla como respuesta
app.get('/ListEmpleados', (req, res) => {
    try {
        // Lee y convierte el archivo "Empleados.json" en un array de objetos
        const listadoEmpleados = JSON.parse(fs.readFileSync("Empleados.json"));

        // Envía la lista de empleados en formato JSON como respuesta al cliente
        res.json(listadoEmpleados);
    } catch (error) {
        // Si ocurre un error (por ejemplo, no se puede leer el archivo), imprime el error y devuelve una respuesta con código 500
        console.error(error);
        res.status(500).send('Error al obtener la lista de empleados');
    }
});

// Endpoint para buscar un dato en el archivo JSON según un campo específico (como 'dni')
app.get('/buscarEmpleado', (req, res) => {
    const { dni } = req.body; // Extrae el campo 'dni' 

    try {
        // Carga todos los empleados desde el archivo JSON
        const listadoEmpleados = cargarEmpleados();

        // Busca el empleado con el 'dni' proporcionado en la lista de empleados
        const empleado = listadoEmpleados.find(e => e.dni === dni);

        if (!empleado) {
            // Si no se encuentra un empleado con ese DNI, responde con error 404
            return res.status(404).send('Error: Empleado no encontrado.');
        }

        // Carga todos los puestos desde el archivo 'puestos.json'
        const listadoPuestos = cargarPuestos();

        // Busca el puesto asociado al 'dni' en los puestos
        const puesto = listadoPuestos.find(p => p.dni === dni);

        // Si se encuentra el puesto, se extraen los datos; si no, se asigna "no disponible"
        const puestoInfo = puesto ? {
            puesto: puesto.puesto,
            codigo: puesto.codigo
        } : {
            puesto: "no asignado",
            codigo: "no asignado"
        };
        const listadoDH = cargarDesarrolloHumano();

        const capacitacion = listadoDH.find(p => p.dni === dni);

        const capacitacionInfo = capacitacion ? {
            capacitacion: capacitacion.capacitacion,
        } : {
            capacitacion: "no asignado"
        };

        const ListLicencias = cargarLicencias();

        const licecias = ListLicencias.find(l => l.dni === dni);

        const licenciaInfo = licecias ? {
            EstaEnLicencia: true
        } : {
            EstaEnLicencia: false
        };

        // Crea un objeto con la información del empleado y el puesto
        const datosEmpleado = {
            nombre: empleado.nombre,
            dni: empleado.dni,
            direccion: empleado.direccion,
            telefono: empleado.telefono,
            correoElectronico: empleado.correoElectronico,
            fechaNacimiento: empleado.fechaNacimiento,
            puesto: puestoInfo.puesto,
            codigo: puestoInfo.codigo,
            capacitacion: capacitacionInfo.capacitacion,
            EstaEnLicencia: licenciaInfo.EstaEnLicencia
        };

        // Se envía la información del empleado como respuesta en formato JSON
        res.json(datosEmpleado);
    } catch (error) {
        // En caso de error al procesar la solicitud, responde con error 500
        console.error(error);
        res.status(500).send('Error al procesar la solicitud');
    }
});



// Endpoint para agregar una capacitación a un elemento existente
app.post('/AgregarCapacitacion', (req, res) => {
    const { dni } = req.body; // Extrae el campo 'dni' desde el cuerpo de la solicitud

    // Verifica si el DNI fue proporcionado en la solicitud
    if (!dni) {
        return res.status(400).send('Error: Debes proporcionar el DNI del empleado.'); // Si no, responde con error 400
    }

    try {
        // Carga los datos de desarrollo humano (capacitaciones)
        const desarrolloHumano = cargarDesarrolloHumano();

        // Verifica si el empleado ya tiene asignada esta capacitación
        const empleadoExistente = desarrolloHumano.find(emp => emp.dni === dni && emp.capacitacion === "Desarrollo Humano");
        if (empleadoExistente) {
            // Si ya tiene la capacitación, responde con un error 400
            return res.status(400).send('Error: El empleado ya tiene esta capacitación.');
        }

        // Si no tiene la capacitación, agrega un nuevo registro de capacitación para el empleado
        desarrolloHumano.push({ dni, capacitacion: "Desarrollo Humano" });

        // Guarda los datos actualizados en el archivo JSON
        fs.writeFileSync('DesarrolloHumano.json', JSON.stringify(desarrolloHumano));

        // Responde confirmando que la capacitación fue agregada
        res.send('Capacitación agregada con éxito.');
    } catch (error) {
        // Si ocurre un error en cualquier parte del proceso, responde con error 500
        console.error(error);
        res.status(500).send('Error al agregar capacitación');
    }
});


app.delete('/eliminarEmpleado', (req, res) => {
    const dni = req.body.dni;  // Se obtiene el DNI del cuerpo de la solicitud

    try {
        // Carga las listas de empleados, desarrollo humano, licencias y puestos
        const listadoEmpleados = cargarEmpleados();
        const listadoDH = cargarDesarrolloHumano();
        const listadoLicencias = cargarLicencias();
        const listadopuestos = cargarPuestos();

        // Busca al empleado por su DNI en la lista de empleados
        const empleadoList = listadoEmpleados.findIndex(empleado => empleado.dni === dni);
        if (empleadoList === -1) {
            return res.status(404).send('Error: Empleado no encontrado.');  // Si no se encuentra al empleado, responde con un error
        }

        // Elimina al empleado de la lista de empleados y guarda los cambios
        listadoEmpleados.splice(empleadoList, 1);
        fs.writeFileSync("Empleados.json", JSON.stringify(listadoEmpleados));

        // Elimina la licencia del empleado si existe
        const licenciaIndex = listadoLicencias.findIndex(licencia => licencia.dni === dni);
        if (licenciaIndex !== -1) {
            listadoLicencias.splice(licenciaIndex, 1);
            fs.writeFileSync("Licencias.json", JSON.stringify(listadoLicencias));
        }

        // Elimina el desarrollo humano del empleado si existe
        const DHIndex = listadoDH.findIndex(dh => dh.dni === dni);
        if (DHIndex !== -1) {
            listadoDH.splice(DHIndex, 1);
            fs.writeFileSync("desarrolloHumano.json", JSON.stringify(listadoDH));
        }

        // Elimina el puesto asignado al empleado si existe
        const puestoIndex = listadopuestos.findIndex(p => p.dni === dni);
        if (puestoIndex !== -1) {
            delete listadopuestos[puestoIndex].dni;  // Elimina el DNI del puesto
            fs.writeFileSync("puestos.json", JSON.stringify(listadopuestos));  // Guarda los cambios en los puestos
        }

        res.send('Empleado eliminado correctamente');  // Responde con éxito
    } catch (error) {
        console.error(error);  // Muestra el error en la consola
        res.status(500).send('Error al eliminar el Empleado');  // Responde con un error en caso de fallo
    }
});


app.delete('/eliminarCapacitacion', (req, res) => {
    const dni = req.body.dni;

    try {
        let listadoDH = JSON.parse(fs.readFileSync("desarrolloHumano.json"));

        const empleadoList = listadoDH.findIndex(empleado => empleado.dni === dni);


        if (empleadoList === -1) {
            return res.status(404).send('Error: Empleado no encontrado.');
        }

        if (empleadoList !== -1) {
            listadoDH.splice(empleadoList, 1);
            fs.writeFileSync("desarrolloHumano.json", JSON.stringify(listadoDH));
        }
        res.send('Empleado eliminado correctamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el Empleado');
    }
});


app.post('/Subirdepartamento', (req, res) => {
    const nuevoDepartamento = req.body;  // Obtiene los datos del nuevo departamento

    try {
        let listadoDepartamentos = JSON.parse(fs.readFileSync("departamentos.json"));  // Carga la lista de departamentos

        // Verifica si el departamento ya existe
        const departamentoExistente = listadoDepartamentos.find(dep => dep.departamento === nuevoDepartamento.departamento);
        if (departamentoExistente) {
            return res.status(400).send('Error: El departamento ya existe.');  // Responde si el departamento ya existe
        }

        // Verifica si el código del departamento ya existe
        const codigoExistente = listadoDepartamentos.find(dep => dep.codigo === nuevoDepartamento.codigo);
        if (codigoExistente) {
            return res.status(400).send('Error: El codigo ya existe.');  // Responde si el código ya existe
        }

        // Agrega el nuevo departamento y guarda los cambios
        listadoDepartamentos.push({ codigo: nuevoDepartamento.codigo, departamento: nuevoDepartamento.departamento, estado: nuevoDepartamento.estado });
        fs.writeFileSync("departamentos.json", JSON.stringify(listadoDepartamentos));

        res.send('Departamento agregado correctamente');  // Responde con éxito
    } catch (error) {
        console.error(error);  // Muestra el error en la consola
        res.status(500).send('Error al procesar la solicitud');  // Responde con un error en caso de fallo
    }
});

app.post('/Subirpuesto', (req, res) => {
    const nuevopuesto = req.body;

    try {
        const listadopuestos = JSON.parse(fs.readFileSync("puestos.json"));

        const puestoExistente = listadopuestos.find(puesto =>
            puesto.puesto === nuevopuesto.puesto && puesto.codigo === nuevopuesto.codigo
        );

        if (puestoExistente) {
            return res.status(400).send('Error: Ya existe un puesto con el mismo nombre y código en ese departamento.');
        }

        listadopuestos.push({
            codigo: nuevopuesto.codigo,
            puesto: nuevopuesto.puesto,
            estado: nuevopuesto.estado
        });

        fs.writeFileSync("puestos.json", JSON.stringify(listadopuestos));
        res.send('Puesto agregado correctamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al procesar la solicitud');
    }
});


app.put('/SubirLicencias', (req, res) => {
    const nuevoLicencia = req.body;  // Obtiene los datos de la nueva licencia

    try {
        const listadoLicencias = cargarLicencias();  // Carga la lista de licencias
        const listadopuestos = cargarPuestos();  // Carga la lista de puestos

        // Verifica si el empleado ya tiene licencia
        const licenciaExistente = listadoLicencias.find(licencia => licencia.dni === nuevoLicencia.dni);
        if (licenciaExistente) {
            return res.status(400).send('Error: El empleado ya esta en licencia.');  // Responde si el empleado ya tiene licencia
        }

        // Elimina el puesto asignado al empleado si está en licencia
        const puestoActual = listadopuestos.find(puesto => puesto.dni === nuevoLicencia.dni);
        if (puestoActual) {
            listadopuestos.forEach(puesto => {
                if (puesto.dni === nuevoLicencia.dni) {
                    delete puesto.dni;  // Elimina el DNI del puesto
                }
            });
            fs.writeFileSync("puestos.json", JSON.stringify(listadopuestos));  // Guarda los cambios en los puestos
        }

        // Agrega la nueva licencia y guarda los cambios
        listadoLicencias.push({ dni: nuevoLicencia.dni, puesto: nuevoLicencia.puesto });
        fs.writeFileSync("Licencias.json", JSON.stringify(listadoLicencias));

        res.send('Licencia agregada correctamente');  // Responde con éxito
    } catch (error) {
        console.error(error);  // Muestra el error en la consola
        res.status(500).send('Error al procesar la solicitud');  // Responde con un error en caso de fallo
    }
});


app.put('/SubirEmpleadoyPuesto', (req, res) => {
    const nuevoEmpleado = req.body;

    try {
        const listadoEmpleados = cargarEmpleados();
        const listadopuestos = cargarPuestos();
        const listadoReclutamiento = cargarReclutamiento();

        const empleadoExistente = listadoEmpleados.find(empleado => empleado.dni === nuevoEmpleado.dni);
        if (empleadoExistente) {
            return res.status(400).send('Error: El empleado ya existe.');
        }
        const reclutarExistente = listadoReclutamiento.find(rec => rec.dni === nuevoEmpleado.dni);
        if (!reclutarExistente) {
            return res.status(400).send('Error: No se encontro en reclutamiento.');
        }


        const puestoExistente = listadopuestos.find(puesto =>
            puesto.puesto === nuevoEmpleado.puesto && puesto.codigo === nuevoEmpleado.codigo
        );

        if (puestoExistente) {
            if (puestoExistente.dni && puestoExistente.dni !== nuevoEmpleado.dni) {
                return res.status(400).send('Error: El puesto ya está asignado a otro empleado.');
            }

            if (!puestoExistente.dni) {
                puestoExistente.dni = nuevoEmpleado.dni;
                fs.writeFileSync("puestos.json", JSON.stringify(listadopuestos));

                listadoEmpleados.push({ nombre: nuevoEmpleado.nombre, dni: nuevoEmpleado.dni, direccion: nuevoEmpleado.direccion, telefono: nuevoEmpleado.telefono, correoElectronico: nuevoEmpleado.correoElectronico, fechaNacimiento: nuevoEmpleado.fechaNacimiento });
                fs.writeFileSync("Empleados.json", JSON.stringify(listadoEmpleados));

                const reclutado = listadoReclutamiento.findIndex(reclutar => reclutar.dni === nuevoEmpleado.dni);
                if (reclutado !== -1) {
                    listadoReclutamiento.splice(reclutado, 1);
                    fs.writeFileSync("reclutamiento.json", JSON.stringify(listadoReclutamiento));
                }
            }
        } else {
            return res.status(400).send('Error: El Puesto no existe.');
        }

        res.send('Empleado agregado y puesto asignado correctamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al procesar la solicitud');
    }
});

app.put('/ActualizarEmpleado', (req, res) => {
    const { dni, nombre, puesto, codigo, direccion, telefono, correoElectronico, fechaNacimiento } = req.body;

    try {
        const listadoEmpleados = cargarEmpleados();
        const listadopuestos = cargarPuestos();

        const empleadoIndex = listadoEmpleados.findIndex(empleado => empleado.dni === dni);
        if (empleadoIndex === -1) {
            return res.status(404).send('Error: Empleado no encontrado.');
        }

        if (nombre) listadoEmpleados[empleadoIndex].nombre = nombre;
        if (direccion) listadoEmpleados[empleadoIndex].direccion = direccion;
        if (telefono) listadoEmpleados[empleadoIndex].telefono = telefono;
        if (correoElectronico) listadoEmpleados[empleadoIndex].correoElectronico = correoElectronico;
        if (fechaNacimiento) listadoEmpleados[empleadoIndex].fechaNacimiento = fechaNacimiento;

        if (puesto && codigo) {
            const puestoAnterior = listadopuestos.find(p => p.dni === dni);
            if (puestoAnterior) {
                delete puestoAnterior.dni;
            }

            const puestoNuevo = listadopuestos.find(p => p.puesto === puesto && p.codigo === codigo);

            if (puestoNuevo) {
                if (puestoNuevo.dni && puestoNuevo.dni !== dni) {
                    return res.status(400).send('Error: El nuevo puesto ya está asignado a otro empleado.');
                }
                puestoNuevo.dni = dni;
            } else {
                return res.status(400).send('Error: El puesto especificado no existe.');
            }
        }

        fs.writeFileSync("puestos.json", JSON.stringify(listadopuestos));
        fs.writeFileSync("Empleados.json", JSON.stringify(listadoEmpleados));

        res.send('Empleado actualizado ');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar la información del empleado');
    }
});




// Ruta para agregar un nuevo empleado a reclutamiento
app.post('/SubirReclutamiento', (req, res) => {
    const nuevoReclutamiento = req.body;

    try {
        // Cargar los archivos existentes de reclutamiento y empleados
        const listadoReclutamiento = cargarReclutamiento();
        const listadoEmpleados = cargarEmpleados();

        // Verificar si el empleado ya existe en la lista de empleados
        const empleadoExistente = listadoEmpleados.find(empleado => empleado.dni === nuevoReclutamiento.dni);
        if (empleadoExistente) {
            return res.status(400).send('Error: ya a sido contratado.'); // Si ya está contratado, no se puede agregar
        }

        // Verificar si el empleado ya está en la lista de reclutamiento
        const yaReclutado = listadoReclutamiento.find(reclutado => reclutado.dni === nuevoReclutamiento.dni);
        if (yaReclutado) {
            return res.status(400).send('Error: ya esta agregado a reclutamiento.'); // Si ya está en reclutamiento, no se puede agregar
        }

        // Si no existe, agregar el nuevo empleado al archivo de reclutamiento
        listadoReclutamiento.push({
            dni: nuevoReclutamiento.dni,
            nombre: nuevoReclutamiento.nombre,
            direccion: nuevoReclutamiento.direccion,
            telefono: nuevoReclutamiento.telefono,
            correoElectronico: nuevoReclutamiento.correoElectronico,
            fechaNacimiento: nuevoReclutamiento.fechaNacimiento
        });

        // Guardar los cambios en el archivo "reclutamiento.json"
        fs.writeFileSync("reclutamiento.json", JSON.stringify(listadoReclutamiento));
        res.send('Agregado correctamente en reclutamiento'); // Responder éxito
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al procesar la solicitud'); // Manejo de errores
    }
});

// Ruta para deshabilitar un departamento
app.delete('/DeshabilitarDepartamento', (req, res) => {
    const { codigo } = req.body;

    try {
        const listadoDepartamentos = cargarDepartamentos();
        const listadopuestos = cargarPuestos();

        // Buscar el departamento por código
        const departamento = listadoDepartamentos.find(depto => depto.codigo === codigo);
        if (!departamento) {
            return res.status(404).send('Error: Departamento no encontrado.'); // Si no se encuentra el departamento, error 404
        }

        // Verificación: si algún puesto del departamento tiene asignado un DNI, no se puede deshabilitar
        const puestoConEmpleado = listadopuestos.some(puesto => puesto.codigo === codigo && puesto.dni);
        if (puestoConEmpleado) {
            return res.status(400).send('Error: No se puede deshabilitar el departamento porque hay empleados asignados a uno o más puestos.'); // Si tiene empleados asignados, no se puede deshabilitar
        }

        if (departamento.estado === false) {
            return res.status(400).send('Error: El departamento ya está deshabilitado.'); // Si ya está deshabilitado, no hacer nada
        }

        // Deshabilitar el departamento y los puestos asociados
        departamento.estado = false;
        listadopuestos.forEach(puesto => {
            if (puesto.codigo === codigo) {
                puesto.estado = false;
            }
        });

        // Guardar los cambios en los archivos "departamentos.json" y "puestos.json"
        fs.writeFileSync("departamentos.json", JSON.stringify(listadoDepartamentos));
        fs.writeFileSync("puestos.json", JSON.stringify(listadopuestos));

        res.send('Departamento y puestos deshabilitados correctamente.'); // Responder éxito
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al deshabilitar el departamento y sus puestos'); // Manejo de errores
    }
});

// Ruta para habilitar un departamento
app.put('/HabilitarDepartamento', (req, res) => {
    const { codigo } = req.body;

    try {
        const listadoDepartamentos = cargarDepartamentos();
        const listadopuestos = cargarPuestos();

        // Buscar el departamento por código
        const departamento = listadoDepartamentos.find(depto => depto.codigo === codigo);
        if (!departamento) {
            return res.status(404).send('Error: Departamento no encontrado.'); // Si no se encuentra el departamento, error 404
        }

        if (departamento.estado === true) {
            return res.status(400).send('Error: El departamento ya está Habilitado.'); // Si ya está habilitado, no hacer nada
        }

        // Habilitar el departamento y los puestos asociados
        departamento.estado = true;
        listadopuestos.forEach(puesto => {
            if (puesto.codigo === codigo) {
                puesto.estado = true;
            }
        });

        // Guardar los cambios en los archivos "departamentos.json" y "puestos.json"
        fs.writeFileSync("departamentos.json", JSON.stringify(listadoDepartamentos));
        fs.writeFileSync("puestos.json", JSON.stringify(listadopuestos));

        res.send('Departamento y puestos habilitados correctamente.'); // Responder éxito
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al habilitar el departamento y sus puestos'); // Manejo de errores
    }
});

// Ruta para actualizar la información de un departamento
app.put('/ActualizarDepartamento', (req, res) => {
    const { codigo, nuevoCodigo, departamento } = req.body;

    try {
        const listadoDepartamentos = cargarDepartamentos();
        const listadopuestos = cargarPuestos();

        // Buscar el departamento por código
        const depEncontrado = listadoDepartamentos.find(depto => depto.codigo === codigo);
        if (!depEncontrado) {
            return res.status(404).send('Error: Departamento no encontrado.'); // Si no se encuentra el departamento, error 404
        }

        // Actualizar el nombre del departamento si se proporciona
        if (departamento) depEncontrado.departamento = departamento;

        // Actualizar el código del departamento si se proporciona un nuevo código
        if (nuevoCodigo && nuevoCodigo !== codigo) {
            const codigoExistente = listadoDepartamentos.find(depto => depto.codigo === nuevoCodigo);
            if (codigoExistente) {
                return res.status(400).send('Error: El nuevo código ya está en uso por otro departamento.'); // Si el nuevo código ya existe, error 400
            }

            depEncontrado.codigo = nuevoCodigo;

            // Actualizar el código de los puestos asociados
            listadopuestos.forEach(puesto => {
                if (puesto.codigo === codigo) {
                    puesto.codigo = nuevoCodigo;
                }
            });
        }

        // Guardar los cambios en los archivos "departamentos.json" y "puestos.json"
        fs.writeFileSync("departamentos.json", JSON.stringify(listadoDepartamentos));
        fs.writeFileSync("puestos.json", JSON.stringify(listadopuestos));

        res.send('Departamento y puestos actualizados correctamente.'); // Responder éxito
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar el departamento y sus puestos'); // Manejo de errores
    }
});

// Ruta para listar los departamentos habilitados con sus puestos
app.get('/ListarDepHabilitados', (req, res) => {
    try {
        const listadoDepartamentos = cargarDepartamentos();
        const listadopuestos = cargarPuestos();

        // Filtrar los departamentos habilitados
        const departamentosHabilitados = listadoDepartamentos.filter(departamento => departamento.estado === true);

        // Asociar los puestos correspondientes a cada departamento habilitado
        const departamentosConPuestos = departamentosHabilitados.map(departamento => {
            const puestosDelDepartamento = listadopuestos.filter(puesto => puesto.codigo === departamento.codigo);
            return {
                ...departamento,
                puestos: puestosDelDepartamento
            };
        });

        // Enviar la respuesta con la lista de departamentos habilitados y sus puestos
        res.json(departamentosConPuestos);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al listar los departamentos con sus puestos'); // Manejo de errores
    }
});

// Ruta para listar los departamentos deshabilitados con sus puestos
app.get('/ListarDepDeshabilitados', (req, res) => {
    try {
        const listadoDepartamentos = cargarDepartamentos();
        const listadopuestos = cargarPuestos();

        // Filtrar los departamentos deshabilitados
        const departamentosHabilitados = listadoDepartamentos.filter(departamento => departamento.estado === false);

        // Asociar los puestos correspondientes a cada departamento deshabilitado
        const departamentosConPuestos = departamentosHabilitados.map(departamento => {
            const puestosDelDepartamento = listadopuestos.filter(puesto => puesto.codigo === departamento.codigo);
            return {
                ...departamento,
                puestos: puestosDelDepartamento
            };
        });

        // Enviar la respuesta con la lista de departamentos deshabilitados y sus puestos
        res.json(departamentosConPuestos);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al listar los departamentos con sus puestos'); // Manejo de errores
    }
});

// Ruta para obtener la lista de licencias
app.get('/ListLicencias', (req, res) => {
    try {
        const listadoLicencias = cargarLicencias(); // Carga las licencias desde el archivo
        res.json(listadoLicencias); // Devuelve la lista de licencias en formato JSON
    } catch (error) {
        console.error(error); // Muestra el error en la consola
        res.status(500).send('Error al obtener la lista de empleados en licencias'); // Responde con un error en caso de fallo
    }
});

// Ruta para obtener la lista de empleados en Desarrollo Humano
app.get('/ListDH', (req, res) => {
    try {
        const listadoDH = cargarDesarrolloHumano(); // Carga los empleados de Desarrollo Humano desde el archivo
        res.json(listadoDH); // Devuelve la lista de empleados en Desarrollo Humano en formato JSON
    } catch (error) {
        console.error(error); // Muestra el error en la consola
        res.status(500).send('Error al obtener la lista de empleados en Desarrollo Humano'); // Responde con un error en caso de fallo
    }
});

// Ruta para obtener la lista de puestos
app.get('/ListPuestos', (req, res) => {
    try {
        const listadopuestos = cargarPuestos(); // Carga los puestos desde el archivo
        res.json(listadopuestos); // Devuelve la lista de puestos en formato JSON
    } catch (error) {
        console.error(error); // Muestra el error en la consola
        res.status(500).send('Error al obtener la lista de puestos'); // Responde con un error en caso de fallo
    }
});

// Ruta para obtener la lista de empleados en reclutamiento
app.get('/ListReclutamiento', (req, res) => {
    try {
        const listadoReclutamiento = cargarReclutamiento(); // Carga los empleados en reclutamiento desde el archivo
        res.json(listadoReclutamiento); // Devuelve la lista de empleados en reclutamiento en formato JSON
    } catch (error) {
        console.error(error); // Muestra el error en la consola
        res.status(500).send('Error al obtener la lista de reclutamientos'); // Responde con un error en caso de fallo
    }
});

// Ruta para eliminar un empleado del proceso de reclutamiento
app.delete('/EliminarReclutamiento', (req, res) => {
    const { dni } = req.body; // Obtiene el DNI del cuerpo de la solicitud
    try {
        const listadoReclutamiento = cargarReclutamiento(); // Carga la lista de reclutamiento

        const empleadoIndex = listadoReclutamiento.findIndex(emp => emp.dni === dni); // Busca el empleado por su DNI
        if (empleadoIndex === -1) {
            return res.status(404).send('Error: Empleado no encontrado en reclutamiento.'); // Si no se encuentra el empleado, responde con error 404
        }

        listadoReclutamiento.splice(empleadoIndex, 1); // Elimina al empleado del listado

        fs.writeFileSync("reclutamiento.json", JSON.stringify(listadoReclutamiento)); // Guarda los cambios en el archivo

        res.send('eliminado de reclutamiento correctamente.'); // Responde con éxito
    } catch (error) {
        console.error(error); // Muestra el error en la consola
        res.status(500).send('Error al eliminar en reclutamiento.'); // Responde con un error en caso de fallo
    }
});

// Ruta para actualizar un puesto existente
app.put('/ActualizarPuesto', (req, res) => {
    const { puesto, codigo, nuevoPuesto } = req.body; // Obtiene los datos del cuerpo de la solicitud

    try {
        const listadopuestos = JSON.parse(fs.readFileSync("puestos.json")); // Carga los puestos desde el archivo

        const puestoExistente = listadopuestos.find(p => p.puesto === puesto && p.codigo === codigo); // Busca el puesto existente
        if (!puestoExistente) {
            return res.status(404).send('Error: El puesto con ese nombre y código no existe.'); // Si no existe, responde con error 404
        }

        const duplicado = listadopuestos.find(p =>
            p.puesto === nuevoPuesto && p.codigo === codigo && p !== puestoExistente // Verifica si ya existe un puesto con el mismo nombre y código
        );

        if (duplicado) {
            return res.status(400).send('Error: Ya existe un puesto con el mismo nombre en ese departamento.'); // Si hay duplicado, responde con error 400
        }

        puestoExistente.puesto = nuevoPuesto; // Actualiza el nombre del puesto

        fs.writeFileSync("puestos.json", JSON.stringify(listadopuestos)); // Guarda los cambios en el archivo

        res.send('Puesto actualizado correctamente.'); // Responde con éxito
    } catch (error) {
        console.error(error); // Muestra el error en la consola
        res.status(500).send('Error al actualizar el puesto.'); // Responde con un error en caso de fallo
    }
});

// Ruta para eliminar un puesto
app.delete('/EliminarPuesto', (req, res) => {
    const { puesto, codigo } = req.body; // Obtiene el puesto y el código del cuerpo de la solicitud

    try {
        const listadopuestos = JSON.parse(fs.readFileSync("puestos.json")); // Carga los puestos desde el archivo

        const puestoExistente = listadopuestos.find(p => p.puesto === puesto && p.codigo === codigo); // Busca el puesto existente
        if (!puestoExistente) {
            return res.status(404).send('Error: El puesto con ese nombre y código no existe.'); // Si no existe, responde con error 404
        }

        if (puestoExistente.dni) {
            return res.status(400).send('Error: No se puede eliminar el puesto porque está asignado a un empleado.'); // Si el puesto está asignado a un empleado, no se puede eliminar
        }

        const nuevosPuestos = listadopuestos.filter(p => !(p.puesto === puesto && p.codigo === codigo)); // Elimina el puesto del listado

        fs.writeFileSync("puestos.json", JSON.stringify(nuevosPuestos)); // Guarda los cambios en el archivo

        res.send('Puesto eliminado correctamente.'); // Responde con éxito
    } catch (error) {
        console.error(error); // Muestra el error en la consola
        res.status(500).send('Error al eliminar el puesto.'); // Responde con un error en caso de fallo
    }
});

// Ruta para bajar un empleado de licencia y asignarle un puesto
app.put('/bajarLicencias', (req, res) => {
    const bajarLicencias = req.body; // Obtiene los datos del cuerpo de la solicitud

    try {
        const listadoEmpleados = cargarEmpleados(); // Carga la lista de empleados
        const listadopuestos = cargarPuestos(); // Carga la lista de puestos
        const listadoLicencias = cargarLicencias(); // Carga la lista de licencias

        const licenciaExistente = listadoLicencias.find(licencia => licencia.dni === bajarLicencias.dni); // Busca si el empleado está en licencias
        if (!licenciaExistente) {
            return res.status(400).send('Error: No se encontro en licencias.'); // Si no está, responde con error
        }

        const puestoExistente = listadopuestos.find(puesto =>
            puesto.puesto === bajarLicencias.puesto && puesto.codigo === bajarLicencias.codigo // Busca el puesto donde se quiere asignar
        );

        if (puestoExistente) {
            if (puestoExistente.dni && puestoExistente.dni !== bajarLicencias.dni) {
                return res.status(400).send('Error: El puesto ya está asignado a otro empleado.'); // Si el puesto ya está asignado a otro empleado, responde con error
            }

            if (!puestoExistente.dni) {
                puestoExistente.dni = bajarLicencias.dni; // Asigna el puesto al empleado

                fs.writeFileSync("puestos.json", JSON.stringify(listadopuestos)); // Guarda los cambios en el archivo de puestos

                const licencia = listadoLicencias.findIndex(licencia => licencia.dni === bajarLicencias.dni); // Elimina el empleado de la lista de licencias
                if (licencia !== -1) {
                    listadoLicencias.splice(licencia, 1);
                    fs.writeFileSync("Licencias.json", JSON.stringify(listadoLicencias)); // Guarda los cambios en el archivo de licencias
                }
            }
        } else {
            return res.status(400).send('Error: El Puesto no existe.'); // Si el puesto no existe, responde con error
        }

        res.send('Empleado agregado y puesto asignado correctamente'); // Responde con éxito
    } catch (error) {
        console.error(error); // Muestra el error en la consola
        res.status(500).send('Error al procesar la solicitud'); // Responde con un error en caso de fallo
    }
});

// Ruta para actualizar la información de un reclutado
app.put('/ActualizarReclutamiento', (req, res) => {
    const { dni, nombre, direccion, telefono, correoElectronico, fechaNacimiento } = req.body;

    try {
        const listadoReclutamiento = cargarReclutamiento();

        const reclutamientoIndex = listadoReclutamiento.findIndex(empleado => empleado.dni === dni);
        if (reclutamientoIndex === -1) {
            return res.status(404).send('Error:  no encontrado en reclutamiento.');
        }


        if (nombre) listadoReclutamiento[reclutamientoIndex].nombre = nombre;
        if (direccion) listadoReclutamiento[reclutamientoIndex].direccion = direccion;
        if (telefono) listadoReclutamiento[reclutamientoIndex].telefono = telefono;
        if (correoElectronico) listadoReclutamiento[reclutamientoIndex].correoElectronico = correoElectronico;
        if (fechaNacimiento) listadoReclutamiento[reclutamientoIndex].fechaNacimiento = fechaNacimiento;

        fs.writeFileSync("reclutamiento.json", JSON.stringify(listadoReclutamiento));

        res.send('actualizado ');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar la información');
    }
});


app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});


