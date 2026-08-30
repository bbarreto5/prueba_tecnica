import type { RequestCategory, RequestDetail } from "../types";
import { mockRequests } from "./requests";

const extraDetailsById: Record<string, { description: string; category: RequestCategory }> = {
  "REQ-1051": {
    description:
      "El cliente solicita agregar una segunda tarjeta como método de pago de respaldo para evitar interrupciones en la facturación mensual.",
    category: "request",
  },
  "REQ-1050": {
    description:
      "Desde ayer los usuarios administradores de la empresa reciben un error 403 al intentar acceder al portal de facturación. El acceso a otras secciones de la plataforma funciona con normalidad.",
    category: "incident",
  },
  "REQ-1049": {
    description:
      "El reporte mensual de actividad se genera vacío desde el cierre de agosto, aunque el proceso finaliza sin errores visibles para el usuario.",
    category: "incident",
  },
  "REQ-1048": {
    description:
      "Se incorporó un nuevo empleado al equipo de operaciones y se solicita crear su usuario con permisos estándar dentro de la plataforma.",
    category: "request",
  },
  "REQ-1047": {
    description:
      "El módulo de reportes se cae de forma intermitente varias veces al día, interrumpiendo la generación de exportes programados.",
    category: "incident",
  },
  "REQ-1046": {
    description:
      "Se solicita actualizar la razón social y los datos fiscales que aparecen en las facturas emitidas por la plataforma.",
    category: "request",
  },
  "REQ-1045": {
    description:
      "El cliente tiene dudas sobre cuántos usuarios y solicitudes mensuales incluye su plan actual antes de contratar uno superior.",
    category: "question",
  },
  "REQ-1044": {
    description:
      "La exportación de datos a CSV se detiene aproximadamente a la mitad del proceso sin mostrar ningún mensaje de error.",
    category: "incident",
  },
  "REQ-1043": {
    description:
      "Al intentar adjuntar archivos mayores a 5MB en una solicitud, el sistema responde con un error 500 y no completa la carga.",
    category: "incident",
  },
  "REQ-1042": {
    description:
      "El cliente solicita cambiar su plan de suscripción actual a uno de menor capacidad ante una reducción en su equipo de trabajo.",
    category: "request",
  },
  "REQ-1041": {
    description:
      "Un usuario quedó bloqueado tras varios intentos fallidos de inicio de sesión y necesita que se le restablezca la contraseña manualmente.",
    category: "request",
  },
  "REQ-1040": {
    description:
      "El cliente evalúa integrar sus sistemas internos con la plataforma vía API y solicita documentación técnica y límites de uso.",
    category: "question",
  },
  "REQ-1039": {
    description:
      "Se detectó que un usuario externo tuvo acceso temporal a un panel interno debido a una configuración de permisos incorrecta.",
    category: "incident",
  },
  "REQ-1038": {
    description:
      "La empresa incorporó nuevos usuarios al equipo y solicita una sesión de capacitación sobre el uso general de la plataforma.",
    category: "request",
  },
  "REQ-1037": {
    description:
      "Los datos sincronizados entre la plataforma y el ERP interno de la empresa presentan discrepancias en los últimos tres días.",
    category: "incident",
  },
};

export const requestDetails: RequestDetail[] = mockRequests.map((request) => ({
  ...request,
  ...extraDetailsById[request.id],
}));

export function getRequestDetail(id: string): RequestDetail | undefined {
  return requestDetails.find((request) => request.id === id);
}
