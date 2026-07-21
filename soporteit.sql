-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3307
-- Tiempo de generación: 08-07-2026 a las 14:28:46
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `soporteit`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tickets`
--

CREATE TABLE `tickets` (
  `id_ticket` int(11) NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `area` varchar(40) DEFAULT NULL,
  `departamento` varchar(40) DEFAULT NULL,
  `fecha_ticket` date NOT NULL,
  `equipo` varchar(50) DEFAULT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `modelo` varchar(50) DEFAULT NULL,
  `placa_af` varchar(50) DEFAULT NULL,
  `numeroserie` varchar(50) DEFAULT NULL,
  `usuario_resp` varchar(40) DEFAULT NULL,
  `contacto_resp` varchar(40) DEFAULT NULL,
  `resp_interno` varchar(50) DEFAULT NULL,
  `resumen` text DEFAULT NULL,
  `ticket_sn` varchar(40) DEFAULT NULL,
  `firma_ingeniero` varchar(100) DEFAULT NULL,
  `firma_jefatura` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Datos comunes para tickets';

--
-- Volcado de datos para la tabla `tickets`
--

INSERT INTO `tickets` (`id_ticket`, `tipo`, `estado`, `area`, `departamento`, `fecha_ticket`, `equipo`, `marca`, `modelo`, `placa_af`, `numeroserie`, `usuario_resp`, `contacto_resp`, `resp_interno`, `resumen`, `ticket_sn`, `firma_ingeniero`, `firma_jefatura`) VALUES
(9, 'Diagnóstico', 'CERRADO', 'A Y B', 'BEBIDAS', '2026-07-06', 'LAPTOP', 'DELL', 'G15 5510', '090982JUD8W9', '20D93J0G', 'MARIA LOPEZ', '984129838', 'KEYLA MARTIN', '', '1', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkkAAAB4CAYAAADmOWYVAAAQAElEQVR4AeydCXRjV5nnv+9KtmtJLV', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkkAAAB4CAYAAADmOWYVAAAQAElEQVR4AeydS4wcx3nHq7p3l8s3aU'),
(11, 'Mantenimiento', 'EN ESPERA', 'TECNOLOGÍA', 'SISTEMAS', '2026-02-23', 'LAPTOP', 'DELL', 'G15 5510', '090982JUD8W9', '20D93J0G', 'ALEJANDRO RAMIREZ', '9841186344', 'KEYLA MARTIN', '', '2', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkkAAAB4CAYAAADmOWYVAAAHPElEQVR4AezWWVIjMRAEUGLuf+iBgG', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkkAAAB4CAYAAADmOWYVAAAHPElEQVR4AezWWVIjMRAEUGLuf+iBgG'),
(12, 'Garantía', 'EN PROCESO', 'SOPORTE', 'SISTEMAS', '2026-07-07', 'IMPRESORA', 'KYOCERA', 'G15 5510', '090982JUD8W9', '20D93J0G', 'LUIS GUITIERREZ', '984129838', 'KEYLA MARTIN', '', '2', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkkAAAB4CAYAAADmOWYVAAAHPElEQVR4AezWWVIjMRAEUGLuf+iBgG', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkkAAAB4CAYAAADmOWYVAAAHPElEQVR4AezWWVIjMRAEUGLuf+iBgG'),
(13, 'Configuración', 'EN PROCESO', 'AMA DE LLAVES', 'DIVISÓN DE CUARTOS', '2026-07-07', 'LAPTOP', 'HP', 'G3', '214234675R46786', 'OWRTHO2W4THN', 'JORGE LÓPEZ', '9841234567', 'AXEL CRUZ', '', '5', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAtwAAACWCAYAAADt9V9KAAAQAElEQVR4Aezai3rbtg4A4Jy9/zvvZK', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAtwAAACWCAYAAADt9V9KAAAQAElEQVR4Aezai3rbtg4A4Jy9/zvvZK'),
(14, 'Diagnóstico', 'ABIERTO', '', '', '2026-07-07', '', '', '', '', '', '', '', 'Administrador', '', '', '', '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket_bitacora`
--

CREATE TABLE `ticket_bitacora` (
  `id_nota` int(11) NOT NULL,
  `fecha_nota` datetime DEFAULT NULL,
  `texto` text DEFAULT NULL,
  `responsable` varchar(50) NOT NULL,
  `adjunto_nombre` varchar(255) DEFAULT NULL,
  `adjunto_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_ticket` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ticket_bitacora`
--

INSERT INTO `ticket_bitacora` (`id_nota`, `fecha_nota`, `texto`, `responsable`, `adjunto_nombre`, `adjunto_path`, `id_usuario`, `id_ticket`) VALUES
(2, '2026-06-19 10:30:14', 'i', 'i', 'CPU.webp', 'uploads/tickets/2/CPU-1781883014421.webp', 1, 2),
(12, '2026-07-07 09:55:48', 'CAMBIO DE BATERIA', 'SONIA RAMIREZ', 'E6BC1AF1FC74B8ACC326752CA14E8EF26F82097B_source.jpg', 'uploads/tickets/13/E6BC1AF1FC74B8ACC326752CA14E8EF26F82097B_source-1783436148369.jpg', 1, 13),
(13, '2026-07-07 10:10:01', 'SE CAMBIO EQUIPO POR UNO NUEVO.', 'CARLOS LUNA', 'images (1).jpg', 'uploads/tickets/9/images_(1)-1783437001637.jpg', 1, 9),
(14, '2026-07-07 10:19:58', 'SE ENTREGO TONER', 'LUIS GUTIERREZ', 'images.jpg', 'uploads/tickets/12/images-1783437598320.jpg', 1, 12);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket_conf`
--

CREATE TABLE `ticket_conf` (
  `id_ticket` int(11) NOT NULL,
  `entrego_cargador` varchar(2) DEFAULT NULL,
  `usuario_windows` varchar(50) DEFAULT NULL,
  `contra_windows` varchar(50) DEFAULT NULL,
  `programas_solicitados` text DEFAULT NULL,
  `id_ticketcomun` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ticket_conf`
--

INSERT INTO `ticket_conf` (`id_ticket`, `entrego_cargador`, `usuario_windows`, `contra_windows`, `programas_solicitados`, `id_ticketcomun`) VALUES
(1, '', '', '', '', 7),
(2, 'NO', 'JORGE23.HXN', 'AMORESVERDADEROS2026', 'OFFICE, SAP, ZSCALER Y WINRAR.', 13);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket_dm`
--

CREATE TABLE `ticket_dm` (
  `id_ticket` int(11) NOT NULL,
  `usuario_windows` varchar(50) DEFAULT NULL,
  `contra_windows` varchar(50) DEFAULT NULL,
  `nombre_equipo` varchar(50) DEFAULT NULL,
  `tiempo_uso` varchar(50) DEFAULT NULL,
  `procesador` varchar(50) DEFAULT NULL,
  `almacenamiento` varchar(50) DEFAULT NULL,
  `ram` varchar(50) DEFAULT NULL,
  `garantia` varchar(50) DEFAULT NULL,
  `dictamen_tecnico` varchar(5000) DEFAULT NULL,
  `id_ticketcomun` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ticket_dm`
--

INSERT INTO `ticket_dm` (`id_ticket`, `usuario_windows`, `contra_windows`, `nombre_equipo`, `tiempo_uso`, `procesador`, `almacenamiento`, `ram`, `garantia`, `dictamen_tecnico`, `id_ticketcomun`) VALUES
(1, '', '', '', '', '', '', '', '', '', 1),
(2, '', '', '', '', '', '', '', '', '', 2),
(3, '', '', '', '', '', '', '', '', '', 3),
(4, '', '', '', '', '', '', '', '', '', 4),
(5, '', '', '', '', '', '', '', '', '', 5),
(6, 'MARIALOPEZ011', 'HOLAJEJE', 'QWR2456TGHB', '3 AÑOS', 'INTEL I7-', '256GB', '8GB', '', 'Te escribo este mensaje porque necesito sacarme esto del pecho. He estado pensando mucho en nosotros, en todo lo que hemos vivido, en las risas, en las peleas y en cada momento compartido. La verdad es que eres una persona increíble y me ha costado mucho procesar todo. A veces siento que las palabras no son suficientes para expresar lo que significas, pero quería tomarme el tiempo para decirte, sin rodeos ni pretextos, que... te acabo de hacer perder el tiempo leyendo este testamento y caíste en la broma.', 9),
(7, '', '', '', '', '', '', '', '', '', 10),
(8, 'ALEMAR299', 'HOLAJEJE', 'HXMLAPXINGAO01', '3 AÑOS', 'INTEL I5', '512GB', '8GB', '5 AÑOS', 'REQUIERE LIMPIEZA', 11),
(9, '', '', '', '', '', '', '', '', '', 14);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket_evidencias`
--

CREATE TABLE `ticket_evidencias` (
  `id_evidencia` int(11) NOT NULL,
  `id_ticket` int(11) NOT NULL,
  `adjunto_path` varchar(500) NOT NULL,
  `adjunto_nombre` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ticket_evidencias`
--

INSERT INTO `ticket_evidencias` (`id_evidencia`, `id_ticket`, `adjunto_path`, `adjunto_nombre`) VALUES
(1, 9, 'uploads/tickets/9/FODA_2026_(1)-1783271543000.png', 'FODA 2026 (1).png'),
(25, 13, 'uploads\\d113c40ffd8c109ba11d177650c97b7d', 'images (1).jpg'),
(26, 13, 'uploads\\7b0e0c403b62b91470cd367ab03a9e77', 'images (1).jpg'),
(28, 12, 'uploads\\2bef5c3760b17507ef75f8e794fa7ff1', 'images.jpg'),
(30, 13, 'uploads/tickets/13/4124ba3d0118121a1728492183c97776-1783471990466.webp', '4124ba3d0118121a1728492183c97776.webp'),
(31, 13, 'uploads/tickets/13/S1-1783472000299.png', 'S1.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket_gar`
--

CREATE TABLE `ticket_gar` (
  `id_ticket` int(11) NOT NULL,
  `empresa_proveedora` varchar(50) DEFAULT NULL,
  `folio_ticket` varchar(50) DEFAULT NULL,
  `contacto_proveedor` varchar(50) DEFAULT NULL,
  `descripcion_falla` varchar(50) DEFAULT NULL,
  `fecha_reporte_proveedor` date DEFAULT NULL,
  `fecha_envio` date DEFAULT NULL,
  `fecha_recepcion` date DEFAULT NULL,
  `resultado` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `id_ticketcomun` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ticket_gar`
--

INSERT INTO `ticket_gar` (`id_ticket`, `empresa_proveedora`, `folio_ticket`, `contacto_proveedor`, `descripcion_falla`, `fecha_reporte_proveedor`, `fecha_envio`, `fecha_recepcion`, `resultado`, `observaciones`, `id_ticketcomun`) VALUES
(1, '', '', '', '', NULL, NULL, NULL, '', '', 6),
(2, '', '', '', '', NULL, NULL, NULL, '', '', 8),
(3, 'MULTIMATCH', '1254Q27VC2674', '9876543210', 'NO CARGA, BATERIA MUERTA...', NULL, NULL, NULL, 'REEMPLAZO DE TÓNERS', 'NO ERA COMPATIBLE', 12);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `usuario` varchar(30) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `rol` varchar(20) NOT NULL,
  `contra` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Usuarios para la pagina';

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `usuario`, `nombre`, `email`, `rol`, `contra`) VALUES
(1, 'admin', 'admin', '', 'admin', '$2y$10$i/8td/geZkdbBQrroPDzZOy.85FGKKsYhIbjS0kQvmYUrH733XKhi');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id_ticket`);

--
-- Indices de la tabla `ticket_bitacora`
--
ALTER TABLE `ticket_bitacora`
  ADD PRIMARY KEY (`id_nota`);

--
-- Indices de la tabla `ticket_conf`
--
ALTER TABLE `ticket_conf`
  ADD PRIMARY KEY (`id_ticket`);

--
-- Indices de la tabla `ticket_dm`
--
ALTER TABLE `ticket_dm`
  ADD PRIMARY KEY (`id_ticket`);

--
-- Indices de la tabla `ticket_evidencias`
--
ALTER TABLE `ticket_evidencias`
  ADD PRIMARY KEY (`id_evidencia`),
  ADD KEY `fk_ev_ticket` (`id_ticket`);

--
-- Indices de la tabla `ticket_gar`
--
ALTER TABLE `ticket_gar`
  ADD PRIMARY KEY (`id_ticket`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id_ticket` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `ticket_bitacora`
--
ALTER TABLE `ticket_bitacora`
  MODIFY `id_nota` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `ticket_conf`
--
ALTER TABLE `ticket_conf`
  MODIFY `id_ticket` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `ticket_dm`
--
ALTER TABLE `ticket_dm`
  MODIFY `id_ticket` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `ticket_evidencias`
--
ALTER TABLE `ticket_evidencias`
  MODIFY `id_evidencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `ticket_gar`
--
ALTER TABLE `ticket_gar`
  MODIFY `id_ticket` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `ticket_evidencias`
--
ALTER TABLE `ticket_evidencias`
  ADD CONSTRAINT `fk_ev_ticket` FOREIGN KEY (`id_ticket`) REFERENCES `tickets` (`id_ticket`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
