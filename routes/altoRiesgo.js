const AltoRiesgo = require('../models/altoRiesgo');
const Paciente = require('../models/paciente');

const express = require('express');
const app = express();

const _ = require('underscore');

let { verificaToken, verificaAdminRol, rolADE, rolAD } = require('../middleware/autenticacion');
{
  //app.get('/consentimientoInformado', verificaToken, function (req, res) {

  //  //console.log((req ? 'REQ si' : 'REQ no'));
  //  //console.log((req.query ? 'REQ.query si' : 'REQ.query no'));
  //  //console.log((req.query.limite ? 'REQ.query.limite si' : 'REQ.query.limite no'));
  //  //console.log((req.query.desde ? 'REQ.query.desde si' : 'REQ.query.desde no'));
  //  let limite = Number(req.query.limite || 0);
  //  let desde = Number(req.query.desde || 0);
  //  // medico/enfermero(a)/admin usuario
  //  let usuarioId = req.get('usuarioId');
  //  let usuario = req.usuario;

  //  let query = {};
  //  if (usuario.rol === 'ADMIN_ROL' || usuario.rol === 'ENFERMERIA_ROL') {
  //    query = { 'situacionSe': { $eq: 1 } };
  //  }
  //  else {
  //    query = {
  //      'situacionSe': { $eq: 1 }, medicos: {$all: [usuarioId]} };
  //  }

  //  Paciente.find(query)
  //    .limit(limite)
  //    //.populate('usuario', 'nombre email')
  //    .populate('medicos', 'nombre')

  //    .skip(desde)
  //    //.populate('usuario', 'nombre')
  //    .exec((err, pacientes) => {
  //      if (err) {
  //        return res.status(400).
  //          json({ ok: false, error: err });
  //      };
  //      Paciente.countDocuments(query, (err, conteo) => {
  //        if (err) {
  //          return res.status(400).
  //            json({ ok: false, error: err });
  //        }
  //        //console.log('PACIENTES:', pacientes.medicos);
  //        return res.status(200).json({ ok: true, conteo: conteo, pacientes });
  //      });
  //    });
  //});
}
//app.get('/paciente/:id', verificaToken, function (req, res) {
app.get('/altoRiesgo/:id', function (req, res) {
  const id = req.params.id; // Id del paciente
  let token = req.get('token');

  AltoRiesgo.findOne({ paciente: id }, (err, altoRiesgoBD) => {
    if (err) {
      return res.status(400).
        json({ ok: false, error: err, mensaje: 'hubo en error' });
    };

    if (!altoRiesgoBD) {
      return res.status(401).json({ ok: false, mensaje: 'No existe este consentimiento Alto Riesgo' });
    }

    return res.json({ ok: true, altoRiesgo: altoRiesgoBD });
  //}).populate('paciente').populate('medicoAnestesiologo');
  }).populate('paciente');
});

app.post('/altoRiesgo/:id', [verificaToken, rolAD], function (req, res) {


  const id = req.params.id; // Id del paciente

  let body = req.body;

  console.log('2.- POST body= ', body);

  // Busca paciente
  Paciente.findById(id, (err, pacienteBD) => {
    if (err) {
      return res.status(400).json({ ok: false, error: err });

    };
    if (!pacienteBD) {
      return res.status(401).json({ ok: false, error: 'NO ENCONTRÉ AL PACIENTE' });
    };
    
    let altoRiesgo = new AltoRiesgo({
      paciente: id,
      lugarFirma: 'METEPEC, ESTADO DE MÉXICO',
      fechaFirma: body.fechaFirma,
      
      identificacionPaciente: body.identificacionPaciente,
      numeroExpediente: body.numeroExpediente,

      identificacionRepresentanteLegal: body.identificacionRepresentanteLegal,
      nombreRepresentanteLegal: body.nombreRepresentanteLegal,

      estudio: body.estudio, 

      nombreResponsable: body.nombreResponsable,
      firmaBase64Autoriza: body.firmaBase64Autoriza,


      nombreTestigo1: body.nombreTestigo1,
      identificacionTestigo1: body.identificacionTestigo1,
      firmaBase64Testigo1: body.firmaBase64Testigo1,

      nombreTestigo2: body.nombreTestigo2,
      identificacionTestigo2: body.identificacionTestigo2,
      firmaBase64Testigo2: body.firmaBase64Testigo2,

      medico: body.medico,
      firmaBase64Medico: body.firmaBase64Medico,

      /////////////////////////
      //Sello
      fechaCreacionSe: new Date(),
      fechaModificacionSe: new Date(),
      situacionSe: 1, //1-activo
      //fechaBorrado: default nada
      usuarioSe: req.usuario._id
    });

    altoRiesgo.save((err, altoRiesgoBD) => {
      if (err) {
        return res.status(400).json({ ok: false, error: err, body: altoRiesgo });
      };
      return res.status(200).json({ ok: true, altoRiesgo: altoRiesgoBD });
    });
  });

});

app.put('/altoRiesgo/:id', [verificaToken, rolADE], function (req, res) {
  const id = req.params.id; // Id del paciente

  let body = req.body;
  body.usuario = req.usuario._id;
  body.fechaModificacion = Date.now();

  console.log('3.- PUT this.ci= ', body);


  //Paciente.findByIdAndUpdate(id, { diagnosticoEgreso: body.diagnosticoEgreso }, (err, pacienteBD) => {
  Paciente.findById(id, (err, pacienteBD) => {
    if (err) {
      return res.status(400).json({ ok: false, error: err });

    };
    if (!pacienteBD) {
      return res.status(401).json({ ok: false, error: 'NO ENCONTRÉ AL PACIENTE' });
    };

    

    AltoRiesgo.findOneAndUpdate({ paciente: id, 'situacionSe': { $eq: 1 } }, body, { new: true, runValidators: true, context: 'query' }, (err, altoRiesgoBD) => {
      if (err) {
        return res.status(400).
          json({ ok: false, error: { mensaje: err } });
      }
      if (!altoRiesgoBD) {
        return res.status(401).
          json({ ok: false, error: { mensaje: 'No existe  consentimiento alto riesgo.' } });
      }
      return res.json({ ok: true, altoRiesgo: altoRiesgoBD });
    }).populate('paciente');
  });

});

//app.delete('/paciente/:id', [verificaToken, verificaAdminRol], function (req, res) {

//  let id = req.params.id;

//  let modificarEstado = { 'situacionSe': 0 /* borrado*/, 'fechaBorradoSe': new Date().toLocaleString() };

//  Paciente.findByIdAndUpdate(id, modificarEstado, { new: true }, (err, personaBorrado) => {
//    if (err) {
//      return res.status(400).json({ ok: false, error: { mensaje: err } });
//    };
//    if (!personaBorrado) {
//      return res.status(401).
//        json({ ok: false, error: { mensaje: 'No existe paciente.' } });
//    };
//    res.json({ ok: true, personaBorrado });
//  });

//});

//app.put('/paciente/AgregaMedico/:id', [verificaToken, rolADE], function (req, res) {

//  let body = _.pick(req.body, [
//    'medicoId'
//  ]);
//  let id = req.params.id;
//  body.fechaModificacion = Date.now();

//  Paciente.findOne({ _id: id, 'situacionSe': { $eq: 1 } }, body, { new: true, runValidators: true, context: 'query' }, (err, pacienteBD) => {
//    if (err) {
//      return res.status(400).
//        json({ ok: false, mensaje: err });
//    };
//    if (!pacienteBD) {
//      return res.status(401).
//        json({ ok: false, mensaje: 'No existe paciente.' });
//    };

//    /// si existe paciente
//    // verifica que no exista en medicos
//    if (pacienteBD.medicos.indexOf(medicoId) === -1) {
//      pacienteBD.medicos.push(medicoId);
//      // actualiza
//      Paciente.findOneAndUpdate({ _id: id, 'situacionSe': { $eq: 1 } }, pacienteBD, { new: true, runValidators: true, context: 'query' }, (err, pacienteBD) => {
//        if (err) {
//          return res.status(400).
//            json({ ok: false, error: { mensaje: err } });
//        }
//        if (!pacienteBD) {
//          return res.status(401).
//            json({ ok: false, error: { mensaje: 'No existe paciente para actualizar.' } });
//        }
//        return res.status(200).json({ ok: true, paciente: pacienteBD });
//      })
//      // fin actualiza
//    };
//    ///
//    return res.status(400).json({ ok: false, mensaje: 'Ya existe médico tratante.' });
//  })




//});


module.exports = app;
