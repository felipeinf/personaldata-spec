# Personaldata SDK's Package

> Cumplimiento de la Ley 21.719 mediante trazabilidad del consentimiento.
> Law 21.719 compliance through consent traceability.

[Español](#español) · [English](#english)

---

## Español

### Qué es

Personaldata es una familia de librerias SDK que ayuda a equipos de desarrollo a implementar los requisitos de trazabilidad del consentimiento establecidos por la **Ley 21.719** de Chile sobre Protección de Datos Personales.

Se distribuye como **SDK**, no como servicio. Cada organización la instala en su propio stack y conserva el control total sobre dónde y cómo almacena los registros. La librería **nunca almacena, transmite ni accede a datos personales**.

### Por qué existe

La Ley 21.719 pone la carga probatoria en el responsable de datos: debe demostrar que contó con el consentimiento del titular y que el tratamiento fue lícito, leal y transparente (Art. 12 inc. final). Cumplir esa carga exige un registro histórico inmutable y verificable de cada acto del ciclo de vida del consentimiento. Personaldata provee los componentes para construir y validar ese registro de forma defensible.

### Pilares y cobertura legal


| Pilar                                                              | Artículo           |
| ------------------------------------------------------------------ | ------------------ |
| Consentimiento libre, informado, específico e inequívoco           | Art. 12            |
| Información mínima al titular                                      | Art. 14 ter        |
| Finalidad específica, explícita y lícita                           | Art. 3 letra b     |
| Revocación equivalente y no retroactiva                            | Art. 12            |
| Carga probatoria del responsable                                   | Art. 12 inc. final |
| Integridad de los registros                                        | Art. 14 quinquies  |
| Posicionamiento de la herramienta como software, no como encargado | Art. 15 bis        |


### Fundación técnica

Toda la familia comparte una **especificación única** publicada como JSON Schema. La spec define:

- Estructura de las entidades de dominio (`Purpose`, `PolicyVersion`).
- Estructura de cada tipo de evento del ciclo de vida del consentimiento.
- Algoritmo de encadenamiento por hash para garantizar integridad del historial.
- Reglas de validación cruzadas entre entidades y eventos.
- Suite de conformidad: casos de prueba neutros que toda implementación debe pasar.

Cada SDK por lenguaje **consume la spec**, genera sus tipos con herramientas comunitarias de su ecosistema e implementa la lógica de negocio garantizando paridad de comportamiento a través de la suite de conformidad.

### Repositorios


| Repositorio  | Rol                                          | Estado        |
| ------------ | -------------------------------------------- | ------------- |
| `spec`       | Source of truth (JSON Schemas + conformance) | Activo        |
| `node-sdk`   | SDK para Node.js / TypeScript                | En desarrollo |
| `java-sdk`   | SDK para Java                                | Siguiente     |
| `python-sdk` | SDK para Python                              | Planeado      |
| `go-sdk`     | SDK para Go                                  | Planeado      |


### Fuera de alcance

Datos sensibles, NNA, otras bases de licitud, cesiones a terceros, transferencias internacionales, decisiones automatizadas, reporte de vulneraciones y evaluación de impacto.

### Aviso

Esta herramienta es de carácter informativo y operacional. No constituye asesoría legal. Las decisiones de cumplimiento deben tomarse en consulta con asesores legales de la organización.

---

## English

### What it is

Personaldata is a package of SDK's that helps engineering teams implement the consent traceability requirements set by **Chile's Law 21.719** on Personal Data Protection.

It ships as an **SDK**, not a service. Each organization installs it into its own stack and retains full control over where and how records are stored. The library **never stores, transmits, or accesses personal data**.

### Why it exists

Law 21.719 places the burden of proof on the data controller: they must demonstrate that valid consent was obtained and that processing was lawful, fair, and transparent (Art. 12, final paragraph). Meeting this burden requires an immutable, verifiable historical record of every event in the consent lifecycle. Personaldata provides the building blocks to construct and validate such a record in a defensible way.

### Pillars and legal coverage


| Pillar                                                  | Article                 |
| ------------------------------------------------------- | ----------------------- |
| Free, informed, specific and unambiguous consent        | Art. 12                 |
| Minimum information to the data subject                 | Art. 14 ter             |
| Specific, explicit and lawful purpose                   | Art. 3(b)               |
| Equivalent and non-retroactive revocation               | Art. 12                 |
| Controller's burden of proof                            | Art. 12 final paragraph |
| Record integrity                                        | Art. 14 quinquies       |
| Positioning of the tool as software, not as a processor | Art. 15 bis             |


### Technical foundation

The whole family shares a **single specification** published as JSON Schema. The spec defines:

- Domain entity structures (`Purpose`, `PolicyVersion`).
- Event structures for the consent lifecycle.
- Hash chain algorithm to guarantee historical integrity.
- Cross-validation rules between entities and events.
- Conformance suite: language-neutral test cases that every implementation must pass.

Each language SDK **consumes the spec**, generates its types using ecosystem-native tooling, and implements business logic while guaranteeing behavioral parity via the conformance suite.

### Repositories


| Repository   | Role                                         | Status         |
| ------------ | -------------------------------------------- | -------------- |
| `spec`       | Source of truth (JSON Schemas + conformance) | Active         |
| `node-sdk`   | SDK for Node.js / TypeScript                 | In development |
| `java-sdk`   | SDK for Java                                 | Next up        |
| `python-sdk` | SDK for Python                               | Planned        |
| `go-sdk`     | SDK for Go                                   | Planned        |


### Out of scope

Sensitive data, minors, other lawful bases, transfers to third parties, international transfers, automated decisions, breach reporting, and impact assessments.

### Disclaimer

This tool is informational and operational. It does not constitute legal advice. Compliance decisions should be made in consultation with the organization's legal advisors.

# Legal

## Descargo legal

Personaldata (en adelante, "la Herramienta") es un componente de software de naturaleza estrictamente técnica e instrumental, proporcionado "tal cual" y "según disponibilidad", sin garantías de ningún tipo, expresas o implícitas, incluyendo sin limitación las garantías de comerciabilidad, idoneidad para un propósito particular, no infracción, exactitud o integridad.  
La Herramienta no constituye asesoría legal, regulatoria, técnica ni de cumplimiento normativo, y su utilización no establece relación profesional, fiduciaria ni de patrocinio entre el usuario y los autores, contribuyentes, mantenedores o titulares de derechos sobre la Herramienta. La Herramienta no sustituye el juicio profesional de abogados, oficiales de cumplimiento, delegados de protección de datos, auditores ni de ningún otro asesor calificado.  
El uso de la Herramienta no garantiza ni asegura el cumplimiento de la Ley N° 21.719 de la República de Chile, ni de cualquier otra legislación, reglamento, norma técnica, jurisprudencia, lineamiento o resolución administrativa, presente o futura, aplicable en Chile o en cualquier otra jurisdicción.  
La interpretación de la legislación aplicable, la determinación de las bases de licitud del tratamiento, la calificación de los datos, la definición de las finalidades, los plazos de conservación, las medidas de seguridad técnicas y organizativas, la atención de derechos de los titulares, la respuesta ante incidentes, la realización de evaluaciones de impacto, la designación de delegados de protección de datos, los registros de actividades de tratamiento y, en general, toda decisión y obligación de cumplimiento normativo son responsabilidad exclusiva del responsable de datos que opera la Herramienta.  
Los autores, contribuyentes, mantenedores y titulares de derechos de la Herramienta no asumen responsabilidad alguna, contractual, extracontractual, administrativa, civil, penal, regulatoria o de cualquier otra naturaleza, derivada directa o indirectamente del uso, mal uso, incapacidad de uso, defectos, errores, omisiones, interrupciones, fallos de validación, comportamiento inesperado o configuración inadecuada de la Herramienta, ni de las consecuencias jurídicas, sanciones administrativas, multas, indemnizaciones, daños emergentes, lucro cesante, daño moral o reputacional que pudieran derivarse para el usuario, sus titulares de datos o terceros.  
El usuario reconoce y acepta que el cumplimiento de la legislación de protección de datos personales requiere medidas técnicas, organizativas, contractuales, documentales y de gobernanza que exceden el alcance de cualquier herramienta de software, y que la Herramienta es uno de varios componentes posibles dentro de un programa integral de cumplimiento cuya definición, implementación, supervisión y mejora continua le corresponden de manera indelegable.  
Cualquier referencia en la documentación de la Herramienta a artículos, disposiciones o principios de la Ley N° 21.719 o de cualquier otra norma se efectúa con fines exclusivamente ilustrativos y de orientación técnica, sin que dichas referencias constituyan interpretación oficial, opinión jurídica, ni reflejen necesariamente la posición de la Agencia de Protección de Datos Personales de Chile ni de cualquier autoridad de control extranjera. El usuario debe verificar de manera independiente la vigencia, aplicabilidad e interpretación correcta de las normas invocadas.  
Se recomienda enfáticamente a toda organización usuaria obtener asesoría legal calificada en la jurisdicción aplicable antes de implementar, desplegar u operar la Herramienta en entornos productivos, y mantener dicha asesoría de forma continua durante el ciclo de vida del tratamiento de datos.  
Al utilizar la Herramienta, el usuario declara haber leído, comprendido y aceptado los presentes términos en su totalidad.

## Legal Disclaimer

Personaldata (hereinafter, "the Tool") is a software component of strictly technical and instrumental nature, provided "as is" and "as available", without warranties of any kind, express or implied, including without limitation the warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, or completeness.  
The Tool does not constitute legal, regulatory, technical, or compliance advice, and its use does not establish any professional, fiduciary, or representation relationship between the user and the authors, contributors, maintainers, or rights holders of the Tool. The Tool does not replace the professional judgment of attorneys, compliance officers, data protection officers, auditors, or any other qualified advisor.  
Use of the Tool does not guarantee or ensure compliance with Chilean Law No. 21,719, or any other legislation, regulation, technical standard, case law, guideline, or administrative ruling, present or future, applicable in Chile or in any other jurisdiction.  
The interpretation of applicable legislation, the determination of lawful bases for processing, the classification of data, the definition of purposes, retention periods, technical and organizational security measures, the handling of data subject rights, incident response, the performance of impact assessments, the appointment of data protection officers, records of processing activities, and, in general, all decisions and compliance obligations are the sole and exclusive responsibility of the data controller operating the Tool.  
The authors, contributors, maintainers, and rights holders of the Tool assume no liability whatsoever, whether contractual, tortious, administrative, civil, criminal, regulatory, or of any other nature, arising directly or indirectly from the use, misuse, inability to use, defects, errors, omissions, interruptions, validation failures, unexpected behavior, or improper configuration of the Tool, nor for any legal consequences, administrative sanctions, fines, damages, consequential losses, loss of profits, moral or reputational harm that may result for the user, its data subjects, or third parties.  
The user acknowledges and accepts that compliance with personal data protection legislation requires technical, organizational, contractual, documentary, and governance measures that exceed the scope of any software tool, and that the Tool is one of several possible components within a comprehensive compliance program whose definition, implementation, supervision, and continuous improvement are the user's non-delegable responsibility.  
Any reference in the Tool's documentation to articles, provisions, or principles of Law No. 21,719 or any other regulation is made for illustrative and technical guidance purposes only, and such references do not constitute official interpretation, legal opinion, nor do they necessarily reflect the position of the Chilean Personal Data Protection Agency or of any foreign supervisory authority. The user must independently verify the validity, applicability, and correct interpretation of the rules invoked.  
It is strongly recommended that every user organization obtain qualified legal counsel in the applicable jurisdiction prior to implementing, deploying, or operating the Tool in production environments, and maintain such counsel on a continuous basis throughout the data processing lifecycle.  
By using the Tool, the user declares having read, understood, and accepted these terms in their entirety.