// Procesamiento de archivos XLSX
var gk_isXlsx = false;
var gk_xlsxFileLookup = {};
var gk_fileData = {};

function filledCell(cell) {
    return cell !== '' && cell != null;
}

function loadFileData(filename) {
    if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
        try {
            var workbook = XLSX.read(gk_fileData[filename], { type: 'base64' });
            var firstSheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[firstSheetName];
            var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
            var filteredData = jsonData.filter(row => row.some(filledCell));
            var headerRowIndex = filteredData.findIndex((row, index) =>
                row.filter(filledCell).length >= filteredData[index + 1]?.filter(filledCell).length
            );
            if (headerRowIndex === -1 || headerRowIndex > 25) {
                headerRowIndex = 0;
            }
            var csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex));
            csv = XLSX.utils.sheet_to_csv(csv, { header: true });
            return csv;
        } catch (e) {
            console.error('Error al procesar el archivo XLSX:', e);
            return "";
        }
    }
    return gk_fileData[filename] || "";
}

// Menú hamburguesa
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.header__menu-toggle');
    const navLinks = document.querySelector('.header__nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('header__nav-links--active');
        });
    }
});

// Desplazamiento suave para los botones (usado en index.html)
document.addEventListener('DOMContentLoaded', () => {
    const scrollButtons = document.querySelectorAll('.values__scroll-btn');
    scrollButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 60,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Lógica de contraseña para secretaria.html, docentes.html, supervisores.html, direccion.html, e informes.html
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('password-prompt')) {
        const passwords = {
            secretaria: "secretaria123",
            docentes: "docentes123",
            supervisores: "supervisores123",
            direccion: "direccion123",
            informes: "informes123"
        };

        window.checkPassword = function(page) {
            const passwordInput = document.getElementById("password-input").value;
            const errorMessage = document.getElementById("error-message");
            const passwordPrompt = document.getElementById("password-prompt");
            const mainContent = document.getElementById("main-content");

            if (passwordInput === passwords[page]) {
                passwordPrompt.style.display = "none";
                mainContent.style.display = "block";
            } else {
                errorMessage.style.display = "block";
                document.getElementById("password-input").value = "";
            }
        };

        document.getElementById("password-input").addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const page = document.getElementById('password-input').dataset.page || 'secretaria';
                checkPassword(page);
            }
        });
        document.getElementById("password-input").addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const page = document.getElementById('password-input').dataset.page || 'docentes';
                checkPassword(page);
            }
        });
        document.getElementById("password-input").addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const page = document.getElementById('password-input').dataset.page || 'informes';
                checkPassword(page);
            }
        });

        let currentPage = 'secretaria';
        if (window.location.pathname.includes('docentes')) currentPage = 'docentes';
        else if (window.location.pathname.includes('supervisores')) currentPage = 'supervisores';
        else if (window.location.pathname.includes('direccion')) currentPage = 'direccion';
        else if (window.location.pathname.includes('informes')) currentPage = 'informes';
        document.getElementById('password-input').dataset.page = currentPage;
    }
});

// Lógica de filtrado para supervisores.html
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('califications-table') && window.location.pathname.includes('supervisores')) {
        const califications = [
            { estudiante: "Juan Pérez", asignatura: "Matemáticas", grado: "Primero", anio: "2024", calificacion: 90, observacion: "Excelente" },
            { estudiante: "María López", asignatura: "Lenguaje", grado: "Segundo", anio: "2024", calificacion: 85, observacion: "Muy bien" },
            { estudiante: "Carlos Gómez", asignatura: "Ciencias", grado: "Tercero", anio: "2023", calificacion: 70, observacion: "Debe mejorar" },
        ];

        window.filterCalifications = function() {
            const estudianteFiltro = document.getElementById("estudiante-filtro").value;
            const anioFiltro = document.getElementById("anio-filtro").value;
            const asignaturaFiltro = document.getElementById("asignatura-filtro").value;
            const gradoFiltro = document.getElementById("grado-filtro").value;

            const filteredCalifications = califications.filter(cal => {
                return (estudianteFiltro === "" || cal.estudiante === estudianteFiltro) &&
                        (anioFiltro === "" || cal.anio === anioFiltro) &&
                        (asignaturaFiltro === "" || cal.asignatura === asignaturaFiltro) &&
                        (gradoFiltro === "" || cal.grado === gradoFiltro);
            });

            const tbody = document.querySelector("#califications-table tbody");
            tbody.innerHTML = "";

            filteredCalifications.forEach(cal => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="table__td">${cal.estudiante}</td>
                    <td class="table__td">${cal.asignatura}</td>
                    <td class="table__td">${cal.grado}</td>
                    <td class="table__td">${cal.anio}</td>
                    <td class="table__td">${cal.calificacion}</td>
                    <td class="table__td">${cal.observacion}</td>
                `;
                tbody.appendChild(row);
            });

            updateSummary(filteredCalifications);
        };

        function updateSummary(filteredCalifications) {
            const summary = document.getElementById("summary-section");
            if (!summary) return;

            if (filteredCalifications.length === 0) {
                summary.innerHTML = "<p>No hay calificaciones para mostrar.</p>";
                return;
            }

            const promedio = filteredCalifications.reduce((sum, cal) => sum + cal.calificacion, 0) / filteredCalifications.length;
            const maxCal = filteredCalifications.reduce((max, cal) => cal.calificacion > max.calificacion ? cal : max, filteredCalifications[0]);
            const minCal = filteredCalifications.reduce((min, cal) => cal.calificacion < min.calificacion ? cal : min, filteredCalifications[0]);

            summary.innerHTML = `
                <p><strong>Promedio General:</strong> ${promedio.toFixed(2)}</p>
                <p><strong>Número de Estudiantes:</strong> ${filteredCalifications.length}</p>
                <p><strong>Calificación Más Alta:</strong> ${maxCal.calificacion} (${maxCal.estudiante} - ${maxCal.asignatura})</p>
                <p><strong>Calificación Más Baja:</strong> ${minCal.calificacion} (${minCal.estudiante} - ${maxCal.asignatura})</p>
            `;
        }
    }
});

// Lógica de filtrado para informes.html
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('informes')) {
        const students = [
            { estudiante: "Juan Pérez", grado: "Primero", anio: "2024", estado: "Activo" },
            { estudiante: "María López", grado: "Segundo", anio: "2024", estado: "Activo" },
            { estudiante: "Carlos Gómez", grado: "Tercero", anio: "2023", estado: "Inactivo" },
        ];

        window.filterStudents = function() {
            const gradoFiltro = document.getElementById("grado-filtro").value;
            const anioFiltro = document.getElementById("anio-filtro").value;

            const filteredStudents = students.filter(student => {
                return (gradoFiltro === "" || student.grado === gradoFiltro) &&
                        (anioFiltro === "" || student.anio === anioFiltro);
            });

            const tbody = document.querySelector("#students-table tbody");
            tbody.innerHTML = "";

            filteredStudents.forEach(student => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="table__td">${student.estudiante}</td>
                    <td class="table__td">${student.grado}</td>
                    <td class="table__td">${student.anio}</td>
                    <td class="table__td">${student.estado}</td>
                `;
                tbody.appendChild(row);
            });
        };

        const califications = [
            { asignatura: "Matemáticas", anio: "2024", promedio: 90, numEstudiantes: 1 },
            { asignatura: "Lenguaje", anio: "2024", promedio: 85, numEstudiantes: 1 },
            { asignatura: "Ciencias", anio: "2023", promedio: 70, numEstudiantes: 1 },
        ];

        window.filterCalifications = function() {
            const asignaturaFiltro = document.getElementById("asignatura-filtro").value;
            const anioFiltro = document.getElementById("anio-calif-filtro").value;

            const filteredCalifications = califications.filter(cal => {
                return (asignaturaFiltro === "" || cal.asignatura === asignaturaFiltro) &&
                        (anioFiltro === "" || cal.anio === anioFiltro);
            });

            const tbody = document.querySelector("#califications-table tbody");
            tbody.innerHTML = "";

            filteredCalifications.forEach(cal => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="table__td">${cal.asignatura}</td>
                    <td class="table__td">${cal.anio}</td>
                    <td class="table__td">${cal.promedio}</td>
                    <td class="table__td">${cal.numEstudiantes}</td>
                `;
                tbody.appendChild(row);
            });
        };

        const attendance = [
            { estudiante: "Juan Pérez", anio: "2024", asistencias: 170, faltas: 10, porcentaje: 94 },
            { estudiante: "María López", anio: "2024", asistencias: 165, faltas: 15, porcentaje: 92 },
            { estudiante: "Carlos Gómez", anio: "2023", asistencias: 160, faltas: 20, porcentaje: 89 },
        ];

        window.filterAttendance = function() {
            const estudianteFiltro = document.getElementById("estudiante-asist-filtro").value;
            const anioFiltro = document.getElementById("anio-asist-filtro").value;

            const filteredAttendance = attendance.filter(record => {
                return (estudianteFiltro === "" || record.estudiante === estudianteFiltro) &&
                        (anioFiltro === "" || record.anio === anioFiltro);
            });

            const tbody = document.querySelector("#attendance-table tbody");
            tbody.innerHTML = "";

            filteredAttendance.forEach(record => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="table__td">${record.estudiante}</td>
                    <td class="table__td">${record.anio}</td>
                    <td class="table__td">${record.asistencias}</td>
                    <td class="table__td">${record.faltas}</td>
                    <td class="table__td">${record.porcentaje}%</td>
                `;
                tbody.appendChild(row);
            });
        };
    }
});

// Lógica de filtrado para galeria.html
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('galeria')) {
        window.filterGallery = function() {
            const categoriaFiltro = document.getElementById("categoria-filtro").value;
            const galleryItems = document.querySelectorAll(".gallery__item");

            galleryItems.forEach(item => {
                const category = item.getAttribute("data-category");
                if (categoriaFiltro === "" || category === categoriaFiltro) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        };
    }
});

// Lógica de dashboard.html
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard')) {
        // Toggle Sidebar
        const sidebarToggle = document.querySelector('.dashboard__sidebar-toggle');
        const sidebar = document.querySelector('.dashboard__sidebar');
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('dashboard__sidebar--collapsed');
            });
        }

        // Cerrar Sesión
        const logoutButton = document.querySelector('.dashboard__header-logout');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        // Gráfico de estudiantes por grado
        const studentChartCtx = document.getElementById('studentChart').getContext('2d');
        new Chart(studentChartCtx, {
            type: 'doughnut',
            data: {
                labels: ['Primero', 'Segundo', 'Tercero'],
                datasets: [{
                    label: 'Estudiantes por Grado',
                    data: [40, 50, 30],
                    backgroundColor: ['#005f73', '#ee9b00', '#f4f4f4'],
                    borderColor: ['#333'],
                    borderWidth: [2]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#333'
                        }
                    }
                }
            }
        });

        // Gráfico de promedio de calificaciones por asignatura
        const gradesChartCtx = document.getElementById('gradesChart').getContext('2d');
        new Chart(gradesChartCtx, {
            type: 'bar',
            data: {
                labels: ['Matemáticas', 'Lenguaje', 'Ciencias'],
                datasets: [{
                    label: 'Promedio de Calificaciones',
                    data: [90, 85, 70],
                    backgroundColor: '#005f73',
                    borderColor: '#ee9b00',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Calificación Promedio',
                            color: '#333'
                        },
                        ticks: {
                            color: '#333'
                        },
                        grid: {
                            color: '#444'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Asignatura',
                            color: '#333'
                        },
                        ticks: {
                            color: '#333'
                        },
                        grid: {
                            color: '#444'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#333'
                        }
                    }
                }
            }
        });

        // Gráfico de evolución de calificaciones por año
        const supervisorChartCtx = document.getElementById('supervisorChart').getContext('2d');
        new Chart(supervisorChartCtx, {
            type: 'line',
            data: {
                labels: ['2023', '2024', '2025'],
                datasets: [{
                    label: 'Promedio de Calificaciones',
                    data: [70, 87.5, 85],
                    borderColor: '#ee9b00',
                    backgroundColor: 'rgba(238, 155, 0, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Calificación Promedio',
                            color: '#333'
                        },
                        ticks: {
                            color: '#333'
                        },
                        grid: {
                            color: '#444'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Año',
                            color: '#333'
                        },
                        ticks: {
                            color: '#333'
                        },
                        grid: {
                            color: '#444'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#333'
                        }
                    }
                }
            }
        });

        // Gráfico de docentes por asignatura
        const directorChartCtx = document.getElementById('directorChart').getContext('2d');
        new Chart(directorChartCtx, {
            type: 'pie',
            data: {
                labels: ['Matemáticas', 'Lenguaje', 'Ciencias'],
                datasets: [{
                    label: 'Docentes por Asignatura',
                    data: [5, 6, 4],
                    backgroundColor: ['#005f73', '#ee9b00', '#f4f4f4'],
                    borderColor: ['#333'],
                    borderWidth: [2]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#333'
                        }
                    }
                }
            }
        });

        // Gráfico de porcentaje de asistencia por estudiante
        const attendanceChartCtx = document.getElementById('attendanceChart').getContext('2d');
        new Chart(attendanceChartCtx, {
            type: 'bar',
            data: {
                labels: ['Juan Pérez', 'María López', 'Carlos Gómez'],
                datasets: [{
                    label: 'Porcentaje de Asistencia',
                    data: [94, 92, 89],
                    backgroundColor: '#005f73',
                    borderColor: '#ee9b00',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Porcentaje de Asistencia',
                            color: '#333'
                        },
                        ticks: {
                            color: '#333'
                        },
                        grid: {
                            color: '#444'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Estudiante',
                            color: '#333'
                        },
                        ticks: {
                            color: '#333'
                        },
                        grid: {
                            color: '#444'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#333'
                        }
                    }
                }
            }
        });

        // Gráfico de fotos por categoría
        const galleryChartCtx = document.getElementById('galleryChart').getContext('2d');
        new Chart(galleryChartCtx, {
            type: 'pie',
            data: {
                labels: ['Reuniones Docentes', 'Capacitaciones', 'Actividades Internas'],
                datasets: [{
                    label: 'Fotos por Categoría',
                    data: [3, 3, 3],
                    backgroundColor: ['#005f73', '#ee9b00', '#f4f4f4'],
                    borderColor: ['#333'],
                    borderWidth: [2]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#333'
                        }
                    }
                }
            }
        });

        // Gráfico de consultas de soporte por categoría
        const supportChartCtx = document.getElementById('supportChart').getContext('2d');
        new Chart(supportChartCtx, {
            type: 'bar',
            data: {
                labels: ['Técnico', 'Acceso', 'General'],
                datasets: [{
                    label: 'Consultas de Soporte',
                    data: [2, 1, 2],
                    backgroundColor: '#005f73',
                    borderColor: '#ee9b00',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Número de Consultas',
                            color: '#333'
                        },
                        ticks: {
                            color: '#333'
                        },
                        grid: {
                            color: '#444'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Categoría',
                            color: '#333'
                        },
                        ticks: {
                            color: '#333'
                        },
                        grid: {
                            color: '#444'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#333'
                        }
                    }
                }
            }
        });
    }
});

// Galeria.html
// Menú hamburguesa
        document.querySelector('.header__menu-toggle').addEventListener('click', () => {
            document.querySelector('.header__nav-links').classList.toggle('header__nav-links--active');
        });

        // Filtrar galería
        function filterGallery() {
            const categoriaFiltro = document.getElementById("categoria-filtro").value;
            const galleryItems = document.querySelectorAll(".gallery__item");

            galleryItems.forEach(item => {
                const category = item.getAttribute("data-category");
                if (categoriaFiltro === "" || category === categoriaFiltro) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        }

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    let page = '';

    if (path.includes('secretaria')) page = 'secretaria';
    else if (path.includes('docentes')) page = 'docentes';
    else if (path.includes('supervisores')) page = 'supervisores';
    else if (path.includes('direccion')) page = 'direccion';
    else if (path.includes('informes')) page = 'informes';

    if (page) {
        const passwordPrompt = document.getElementById('password-prompt');
        const mainContent = document.getElementById('main-content');
        if (!passwordPrompt || !mainContent) {
            console.error('Elementos iniciales del DOM no encontrados:', {
                passwordPrompt: !!passwordPrompt,
                mainContent: !!mainContent
            });
            return;
        }
        if (sessionStorage.getItem(`access_${page}`) !== 'granted') {
            passwordPrompt.style.display = 'flex';
            mainContent.style.display = 'none';
        } else {
            passwordPrompt.style.display = 'none';
            mainContent.style.display = 'block';
        }
    }

    // Datos simulados
    const estudiantes = [
        { ID_Estudiante: 1, Nombre: "Juan", Apellido: "Pérez", Cedula: "12345678" },
        { ID_Estudiante: 2, Nombre: "María", Apellido: "López", Cedula: "87654321" },
        { ID_Estudiante: 3, Nombre: "Carlos", Apellido: "Gómez", Cedula: "11223344" }
    ];
    const asignaturas = [
        { ID_Asignatura: 1, Nombre: "Matemáticas" },
        { ID_Asignatura: 2, Nombre: "Lenguaje" },
        { ID_Asignatura: 3, Nombre: "Ciencias" }
    ];
    const aniosEscolares = [
        { ID_AnioEscolar: 1, Anio: "2024" },
        { ID_AnioEscolar: 2, Anio: "2023" },
        { ID_AnioEscolar: 3, Anio: "2025" }
    ];
    const grados = [
        { ID_Grado: 1, Nombre: "Primero" },
        { ID_Grado: 2, Nombre: "Segundo" },
        { ID_Grado: 3, Nombre: "Tercero" }
    ];
    let docentes = [
        {
            ID_Docente: 1,
            Nombre: "Ana",
            Apellido: "Martínez",
            Cedula: "123456789",
            Correo: "ana.martinez@example.com",
            Contrasena: "docentes123"
        },
        {
            ID_Docente: 2,
            Nombre: "Luis",
            Apellido: "Rodríguez",
            Cedula: "987654321",
            Correo: "luis.rodriguez@example.com",
            Contrasena: "supervisores123"
        }
    ];
    let calificaciones = [
        {
            id: 1,
            idEstudiante: 1,
            estudiante: "Juan Pérez",
            idAsignatura: 1,
            asignatura: "Matemáticas",
            idAnioEscolar: 1,
            anioEscolar: "2024",
            idGrado: 1,
            grado: "Primero",
            calificacion: 90,
            observacion: "Excelente"
        },
        {
            id: 2,
            idEstudiante: 2,
            estudiante: "María López",
            idAsignatura: 2,
            asignatura: "Lenguaje",
            idAnioEscolar: 1,
            anioEscolar: "2024",
            idGrado: 2,
            grado: "Segundo",
            calificacion: 85,
            observacion: "Muy bien"
        },
        {
            id: 3,
            idEstudiante: 3,
            estudiante: "Carlos Gómez",
            idAsignatura: 3,
            asignatura: "Ciencias",
            idAnioEscolar: 2,
            anioEscolar: "2023",
            idGrado: 3,
            grado: "Tercero",
            calificacion: 70,
            observacion: "Debe mejorar"
        }
    ];
    let asistencias = [
        {
            id: 1,
            idEstudiante: 1,
            estudiante: "Juan Pérez",
            idAnioEscolar: 1,
            anioEscolar: "2024",
            fecha: "2024-05-01",
            estado: "Asistencia"
        },
        {
            id: 2,
            idEstudiante: 2,
            estudiante: "María López",
            idAnioEscolar: 1,
            anioEscolar: "2024",
            fecha: "2024-05-01",
            estado: "Falta"
        },
        {
            id: 3,
            idEstudiante: 3,
            estudiante: "Carlos Gómez",
            idAnioEscolar: 2,
            anioEscolar: "2023",
            fecha: "2023-05-01",
            estado: "Tardanza"
        }
    ];
    let inscripciones = [
        { ID_Inscripcion: 1, ID_Estudiante: 1, ID_Grado: 1, ID_AnioEscolar: 1, Estado: "Activo" },
        { ID_Inscripcion: 2, ID_Estudiante: 2, ID_Grado: 2, ID_AnioEscolar: 1, Estado: "Activo" },
        { ID_Inscripcion: 3, ID_Estudiante: 3, ID_Grado: 3, ID_AnioEscolar: 2, Estado: "Inactivo" }
    ];

    // Lógica para secretaria.html
    if (path.includes('secretaria')) {
        const studentFamilyForm = document.getElementById('student-family-form');
        const studentFamilyTable = document.querySelector('#student-family-table tbody');
        const searchInput = document.getElementById('search-student');
        let estudiantesData = [
            {
                idEstudiante: 1,
                nombre: "Juan",
                apellido: "Pérez",
                cedula: "12345678",
                fechaNacimiento: "2010-05-15",
                sexo: "Masculino",
                direccion: "Calle 123",
                correo: "juan@example.com",
                estado: "Sí",
                familiar: {
                    idFamiliar: 1,
                    nombre: "María",
                    apellido: "Gómez",
                    parentesco: "Madre",
                    telefono: "1234567890",
                    correo: "maria@example.com",
                    especialidad: "Sordo"
                }
            },
            {
                idEstudiante: 2,
                nombre: "María",
                apellido: "López",
                cedula: "87654321",
                fechaNacimiento: "2011-03-20",
                sexo: "Femenino",
                direccion: "Avenida 456",
                correo: "maria.l@example.com",
                estado: "Sí",
                familiar: {
                    idFamiliar: 2,
                    nombre: "Carlos",
                    apellido: "López",
                    parentesco: "Padre",
                    telefono: "0987654321",
                    correo: "carlos@example.com",
                    especialidad: ""
                }
            }
        ];

        function renderStudentFamilyTable(filter = '') {
            studentFamilyTable.innerHTML = '';
            const filteredEstudiantes = estudiantesData.filter(est =>
                est.nombre.toLowerCase().includes(filter.toLowerCase()) ||
                est.apellido.toLowerCase().includes(filter.toLowerCase()) ||
                est.cedula.includes(filter)
            );
            filteredEstudiantes.forEach(est => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="table__td">${est.nombre} ${est.apellido}</td>
                    <td class="table__td">${est.cedula}</td>
                    <td class="table__td">${est.estado}</td>
                    <td class="table__td">${est.familiar ? `${est.familiar.nombre} ${est.familiar.apellido}` : 'N/A'}</td>
                    <td class="table__td">${est.familiar ? est.familiar.parentesco : 'N/A'}</td>
                    <td class="table__td">${est.familiar ? est.familiar.telefono : 'N/A'}</td>
                    <td class="table__td">
                        <button class="form__submit-btn" onclick="editStudentFamily(${est.idEstudiante})">Editar</button>
                        <button class="form__submit-btn" onclick="deleteStudentFamily(${est.idEstudiante})">Eliminar</button>
                    </td>
                `;
                studentFamilyTable.appendChild(row);
            });
        }

        studentFamilyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const estudiante = {
                idEstudiante: estudiantesData.length + 1,
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                cedula: document.getElementById('cedula').value,
                fechaNacimiento: document.getElementById('fecha-nacimiento').value,
                sexo: document.getElementById('sexo').value,
                direccion: document.getElementById('direccion').value,
                correo: document.getElementById('correo').value,
                estado: document.getElementById('estado').value,
                familiar: {
                    idFamiliar: estudiantesData.length + 1,
                    nombre: document.getElementById('nombre-familiar').value,
                    apellido: document.getElementById('apellido-familiar').value,
                    parentesco: document.getElementById('parentesco').value,
                    telefono: document.getElementById('telefono-familiar').value,
                    correo: document.getElementById('correo-familiar').value,
                    especialidad: document.getElementById('especialidad-familiar').value
                }
            };
            estudiantesData.push(estudiante);
            renderStudentFamilyTable();
            studentFamilyForm.reset();
        });

        window.editStudentFamily = function(id) {
            const est = estudiantesData.find(e => e.idEstudiante === id);
            document.getElementById('nombre').value = est.nombre;
            document.getElementById('apellido').value = est.apellido;
            document.getElementById('cedula').value = est.cedula;
            document.getElementById('fecha-nacimiento').value = est.fechaNacimiento;
            document.getElementById('sexo').value = est.sexo;
            document.getElementById('direccion').value = est.direccion;
            document.getElementById('correo').value = est.correo;
            document.getElementById('estado').value = est.estado;
            document.getElementById('nombre-familiar').value = est.familiar.nombre;
            document.getElementById('apellido-familiar').value = est.familiar.apellido;
            document.getElementById('parentesco').value = est.familiar.parentesco;
            document.getElementById('telefono-familiar').value = est.familiar.telefono;
            document.getElementById('correo-familiar').value = est.familiar.correo;
            document.getElementById('especialidad-familiar').value = est.familiar.especialidad;
            deleteStudentFamily(id);
        };

        window.deleteStudentFamily = function(id) {
            estudiantesData = estudiantesData.filter(e => e.idEstudiante !== id);
            renderStudentFamilyTable();
        };

        searchInput.addEventListener('input', (e) => {
            renderStudentFamilyTable(e.target.value);
        });

        renderStudentFamilyTable();

        // CRUD de Asistencias
        const attendanceForm = document.getElementById('attendance-form');
        const attendanceTable = document.querySelector('#attendance-table tbody');
        const attendanceSummary = document.getElementById('attendance-summary');

        function loadEstudiantesAttendance() {
            const select = document.getElementById('id-estudiante');
            select.innerHTML = '<option value="">Seleccionar estudiante</option>';
            estudiantes.forEach(est => {
                const option = document.createElement('option');
                option.value = est.ID_Estudiante;
                option.textContent = `${est.Nombre} ${est.Apellido}`;
                select.appendChild(option);
            });
        }

        function loadAniosEscolaresAttendance() {
            const select = document.getElementById('id-anio-escolar');
            select.innerHTML = '<option value="">Seleccionar año escolar</option>';
            aniosEscolares.forEach(anio => {
                const option = document.createElement('option');
                option.value = anio.ID_AnioEscolar;
                option.textContent = anio.Anio;
                select.appendChild(option);
            });
        }

        function renderAsistenciasSecretary() {
            attendanceTable.innerHTML = '';
            asistencias.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="table__td">${record.estudiante}</td>
                    <td class="table__td">${record.anioEscolar}</td>
                    <td class="table__td">${record.fecha}</td>
                    <td class="table__td">${record.estado}</td>
                    <td class="table__td">
                        <button class="form__submit-btn" onclick="editAsistencia(${record.id})">Editar</button>
                        <button class="form__submit-btn" onclick="deleteAsistencia(${record.id})">Eliminar</button>
                    </td>
                `;
                attendanceTable.appendChild(row);
            });
            updateAttendanceSummary();
        }

        function updateAttendanceSummary() {
            const summaryData = {};
            asistencias.forEach(record => {
                const key = `${record.idEstudiante}-${record.idAnioEscolar}`;
                if (!summaryData[key]) {
                    summaryData[key] = {
                        estudiante: record.estudiante,
                        anioEscolar: record.anioEscolar,
                        asistencias: 0,
                        faltas: 0
                    };
                }
                if (record.estado === 'Asistencia') {
                    summaryData[key].asistencias += 1;
                } else {
                    summaryData[key].faltas += 1;
                }
            });

            attendanceSummary.innerHTML = '';
            Object.values(summaryData).forEach(data => {
                const total = data.asistencias + data.faltas;
                const porcentaje = total > 0 ? Math.round((data.asistencias / total) * 100) : 0;
                const p = document.createElement('p');
                p.className = 'summary__text';
                p.innerHTML = `<strong>${data.estudiante} (${data.anioEscolar}):</strong> Asistencias: ${data.asistencias}, Faltas: ${data.faltas}, Porcentaje: ${porcentaje}%`;
                attendanceSummary.appendChild(p);
            });
        }

        attendanceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newRecord = {
                id: asistencias.length + 1,
                idEstudiante: parseInt(document.getElementById('id-estudiante').value),
                estudiante: document.querySelector('#id-estudiante option:checked').textContent,
                idAnioEscolar: parseInt(document.getElementById('id-anio-escolar').value),
                anioEscolar: document.querySelector('#id-anio-escolar option:checked').textContent,
                fecha: document.getElementById('fecha').value,
                estado: document.getElementById('estado').value
            };
            asistencias.push(newRecord);
            renderAsistenciasSecretary();
            attendanceForm.reset();
        });

        window.editAsistencia = function(id) {
            const record = asistencias.find(r => r.id === id);
            document.getElementById('id-estudiante').value = record.idEstudiante;
            document.getElementById('id-anio-escolar').value = record.idAnioEscolar;
            document.getElementById('fecha').value = record.fecha;
            document.getElementById('estado').value = record.estado;
            deleteAsistencia(id);
        };

        window.deleteAsistencia = function(id) {
            asistencias = asistencias.filter(r => r.id !== id);
            renderAsistenciasSecretary();
        };

        loadEstudiantesAttendance();
        loadAniosEscolaresAttendance();
        renderAsistenciasSecretary();
    }

    // Lógica para docentes
    if (path.includes('docentes')) {
        const gradesForm = document.getElementById('grades-form');
        const gradesTable = document.querySelector('#grades-table tbody');
        const filterStudent = document.getElementById('filter-student');
        const searchGradeInput = document.getElementById('search-grade');
        const attendanceTable = document.querySelector('#attendance-table tbody');
        const searchAttendanceInput = document.getElementById('search-attendance');

        function loadEstudiantes() {
            const selectForm = document.getElementById('id-estudiante');
            const selectFilter = document.getElementById('filter-student');
            selectForm.innerHTML = '<option value="">Seleccionar estudiante</option>';
            selectFilter.innerHTML = '<option value="">Todos los estudiantes</option>';
            estudiantes.forEach(est => {
                const optionForm = document.createElement('option');
                optionForm.value = est.ID_Estudiante;
                optionForm.textContent = `${est.Nombre} ${est.Apellido}`;
                selectForm.appendChild(optionForm);
                const optionFilter = document.createElement('option');
                optionFilter.value = est.ID_Estudiante;
                optionFilter.textContent = `${est.Nombre} ${est.Apellido}`;
                selectFilter.appendChild(optionFilter);
            });
        }

        function loadAsignaturas() {
            const select = document.getElementById('id-asignatura');
            select.innerHTML = '<option value="">Seleccionar asignatura</option>';
            asignaturas.forEach(asig => {
                const option = document.createElement('option');
                option.value = asig.ID_Asignatura;
                option.textContent = asig.Nombre;
                select.appendChild(option);
            });
        }

        function loadAnios() {
            const select = document.getElementById('id-anio-escolar');
            select.innerHTML = '<option value="">Seleccionar año escolar</option>';
            aniosEscolares.forEach(anio => {
                const option = document.createElement('option');
                option.value = anio.ID_AnioEscolar;
                option.textContent = anio.Anio;
                select.appendChild(option);
            });
        }

        function renderCalificaciones(studentId = '', filter = '') {
            gradesTable.innerHTML = '';
            let filtered = calificaciones;
            if (studentId) {
                filtered = filtered.filter(cal => cal.idEstudiante === parseInt(studentId));
            }
            if (filter) {
                filtered = filtered.filter(cal =>
                    cal.estudiante.toLowerCase().includes(filter.toLowerCase()) ||
                    cal.asignatura.toLowerCase().includes(filter.toLowerCase())
                );
            }
            filtered.forEach(cal => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="table__td">${cal.estudiante}</td>
                    <td class="table__td">${cal.asignatura}</td>
                    <td class="table__td">${cal.anioEscolar}</td>
                    <td class="table__td">${cal.calificacion}</td>
                    <td class="table__td">${cal.observacion || ''}</td>
                    <td class="table__td">
                        <button class="form__submit-btn" onclick="editCalificacion(${cal.id})">Editar</button>
                        <button class="form__submit-btn" onclick="deleteCalificacion(${cal.id})">Eliminar</button>
                    </td>
                `;
                gradesTable.appendChild(row);
            });
        }

        function renderAsistencias(studentId = '', filter = '') {
            attendanceTable.innerHTML = '';
            let filtered = asistencias;
            if (studentId) {
                filtered = filtered.filter(att => att.idEstudiante === parseInt(studentId));
            }
            if (filter) {
                filtered = filtered.filter(att =>
                    att.estudiante.toLowerCase().includes(filter.toLowerCase())
                );
            }
            filtered.forEach(att => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="table__td">${att.estudiante}</td>
                    <td class="table__td">${att.anioEscolar}</td>
                    <td class="table__td">${att.fecha}</td>
                    <td class="table__td">${att.estado}</td>
                `;
                attendanceTable.appendChild(row);
            });
        }

        gradesForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newCal = {
                id: calificaciones.length + 1,
                idEstudiante: parseInt(document.getElementById('id-estudiante').value),
                estudiante: document.querySelector('#id-estudiante option:checked').textContent,
                idAsignatura: parseInt(document.getElementById('id-asignatura').value),
                asignatura: document.querySelector('#id-asignatura option:checked').textContent,
                idAnioEscolar: parseInt(document.getElementById('id-anio-escolar').value),
                anioEscolar: document.querySelector('#id-anio-escolar option:checked').textContent,
                idGrado: 1,
                grado: "Primero",
                calificacion: parseFloat(document.getElementById('calificacion').value),
                observacion: document.getElementById('observacion').value
            };
            calificaciones.push(newCal);
            renderCalificaciones(filterStudent.value, searchGradeInput.value);
            gradesForm.reset();
        });

        window.editCalificacion = function(id) {
            const cal = calificaciones.find(c => c.id === id);
            document.getElementById('id-estudiante').value = cal.idEstudiante;
            document.getElementById('id-asignatura').value = cal.idAsignatura;
            document.getElementById('id-anio-escolar').value = cal.idAnioEscolar;
            document.getElementById('calificacion').value = cal.calificacion;
            document.getElementById('observacion').value = cal.observacion;
            deleteCalificacion(id);
        };

        window.deleteCalificacion = function(id) {
            calificaciones = calificaciones.filter(c => c.id !== id);
            renderCalificaciones(filterStudent.value, searchGradeInput.value);
        };

        filterStudent.addEventListener('change', () => {
            renderCalificaciones(filterStudent.value, searchGradeInput.value);
            renderAsistencias(filterStudent.value, searchAttendanceInput.value);
        });

        searchGradeInput.addEventListener('input', () => {
            renderCalificaciones(filterStudent.value, searchGradeInput.value);
        });

        searchAttendanceInput.addEventListener('input', () => {
            renderAsistencias(filterStudent.value, searchAttendanceInput.value);
        });

        loadEstudiantes();
        loadAsignaturas();
        loadAnios();
        renderCalificaciones();
        renderAsistencias();
    }

    // Lógica para supervisores
    if (path.includes('supervisores')) {
        const gradesTable = document.querySelector('#califications-table tbody');
        const attendanceTable = document.querySelector('#attendance-table tbody');
        const searchGradeInput = document.getElementById('search-grade');
        const searchAttendanceInput = document.getElementById('search-attendance');
        const summarySection = document.getElementById('summary-section');

        function renderCalificaciones(filter = '') {
            gradesTable.innerHTML = '';
            const filtered = calificaciones.filter(cal =>
                cal.estudiante.toLowerCase().includes(filter.toLowerCase()) ||
                cal.asignatura.toLowerCase().includes(filter.toLowerCase())
            );
            filtered.forEach(cal => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="table__td">${cal.estudiante}</td>
                    <td class="table__td">${cal.asignatura}</td>
                    <td class="table__td">${cal.grado}</td>
                    <td class="table__td">${cal.anioEscolar}</td>
                    <td class="table__td">${cal.calificacion}</td>
                    <td class="table__td">${cal.observacion || ''}</td>
                `;
                gradesTable.appendChild(row);
            });
            updateSummary();
        }

        function updateSummary() {
            const totalCal = calificaciones.length;
            const avgCal = totalCal > 0 ? (calificaciones.reduce((sum, cal) => sum + cal.calificacion, 0) / totalCal).toFixed(2) : 0;
            const highestCal = calificaciones.length > 0 ? calificaciones.reduce((max, cal) => Math.max(max, cal.calificacion), 0) : 0;
            const highestCalStudent = calificaciones.find(cal => cal.calificacion === highestCal);
            const lowestCal = calificaciones.length > 0 ? calificaciones.reduce((min, cal) => Math.min(min, cal.calificacion), 100) : 0;
            const lowestCalStudent = calificaciones.find(cal => cal.calificacion === lowestCal);

            summarySection.innerHTML = `
                <p><strong>Promedio General:</strong> ${avgCal}</p>
                <p><strong>Número de Estudiantes:</strong> ${new Set(calificaciones.map(cal => cal.idEstudiante)).size}</p>
                <p><strong>Calificación Más Alta:</strong> ${highestCal} (${highestCalStudent ? `${highestCalStudent.estudiante} - ${highestCalStudent.asignatura}` : ''})</p>
                <p><strong>Calificación Más Baja:</strong> ${lowestCal} (${lowestCalStudent ? `${lowestCalStudent.estudiante} - ${lowestCalStudent.asignatura}` : ''})</p>
            `;
        }

        function renderAsistencias(filter = '') {
            attendanceTable.innerHTML = '';
            const filtered = asistencias.filter(att =>
                att.estudiante.toLowerCase().includes(filter.toLowerCase())
            );
            filtered.forEach(att => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="table__td">${att.estudiante}</td>
                    <td class="table__td">${att.anioEscolar}</td>
                    <td class="table__td">${att.fecha}</td>
                    <td class="table__td">${att.estado}</td>
                `;
                attendanceTable.appendChild(row);
            });
        }

        searchGradeInput.addEventListener('input', () => {
            renderCalificaciones(searchGradeInput.value);
        });

        searchAttendanceInput.addEventListener('input', () => {
            renderAsistencias(searchAttendanceInput.value);
        });

        renderCalificaciones();
        renderAsistencias();
    }

    // Lógica para dirección
    if (path.includes('direccion')) {
        const gradeForm = document.getElementById('grade-form');
        const gradeTable = document.querySelector('#grade-table tbody');
        const searchGradeInput = document.getElementById('search-grade');
        const yearForm = document.getElementById('year-form');
        const yearTable = document.querySelector('#year-table tbody');
        const searchYearInput = document.getElementById('search-year');
        const teacherForm = document.getElementById('teacher-form');
        const teacherTable = document.querySelector('#teacher-table tbody');
        const searchTeacherInput = document.getElementById('search-teacher');
        const subjectForm = document.getElementById('subject-form');
        const subjectTable = document.querySelector('#subject-table tbody');
        const searchSubjectInput = document.getElementById('search-subject');

        function renderGrades(filter = '') {
            gradeTable.innerHTML = '';
            const filtered = grados.filter(grade =>
                grade.Nombre.toLowerCase().includes(filter.toLowerCase())
            );
            filtered.forEach(grade => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="table__td">${grade.ID_Grado}</td>
                    <td class="table__td">${grade.Nombre}</td>
                    <td class="table__td">
                        <button class="form__submit-btn" onclick="editGrade(${grade.ID_Grado})">Editar</button>
                        <button class="form__submit-btn" onclick="deleteGrade(${grade.ID_Grado})">Eliminar</button>
                    </td>
                `;
                gradeTable.appendChild(row);
            });
        }

        function renderYears(filter = '') {
            yearTable.innerHTML = '';
            const filtered = aniosEscolares.filter(year =>
                year.Anio.includes(filter)
            );
            filtered.forEach(year => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="table__td">${year.ID_AnioEscolar}</td>
                    <td class="table__td">${year.Anio}</td>
                    <td class="table__td">
                        <button class="form__submit-btn" onclick="editYear(${year.ID_AnioEscolar})">Editar</button>
                        <button class="form__submit-btn" onclick="deleteYear(${year.ID_AnioEscolar})">Eliminar</button>
                    </td>
                `;
                yearTable.appendChild(row);
            });
        }

        function renderTeachers(filter = '') {
            teacherTable.innerHTML = '';
            const filtered = docentes.filter(teacher =>
                teacher.Nombre.toLowerCase().includes(filter.toLowerCase()) ||
                teacher.Apellido.toLowerCase().includes(filter.toLowerCase()) ||
                teacher.Cedula.includes(filter)
            );
            filtered.forEach(teacher => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="table__td">${teacher.ID_Docente}</td>
                    <td class="table__td">${teacher.Nombre}</td>
                    <td class="table__td">${teacher.Apellido}</td>
                    <td class="table__td">${teacher.Cedula}</td>
                    <td class="table__td">${teacher.Correo || 'N/A'}</td>
                    <td class="table__td">
                        <button class="form__submit-btn" onclick="editTeacher(${teacher.ID_Docente})">Editar</button>
                        <button class="form__submit-btn" onclick="deleteTeacher(${teacher.ID_Docente})">Eliminar</button>
                    </td>
                `;
                teacherTable.appendChild(row);
            });
        }

        function renderSubjects(filter = '') {
            subjectTable.innerHTML = '';
            const filtered = asignaturas.filter(subject =>
                subject.Nombre.toLowerCase().includes(filter.toLowerCase())
            );
            filtered.forEach(subject => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="table__td">${subject.ID_Asignatura}</td>
                    <td class="table__td">${subject.Nombre}</td>
                    <td class="table__td">
                        <button class="form__submit-btn" onclick="editSubject(${subject.ID_Asignatura})">Editar</button>
                        <button class="form__submit-btn" onclick="deleteSubject(${subject.ID_Asignatura})">Eliminar</button>
                    </td>
                `;
                subjectTable.appendChild(row);
            });
        }

        gradeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newGrade = {
                ID_Grado: grados.length + 1,
                Nombre: document.getElementById('nombre-grado').value
            };
            grados.push(newGrade);
            renderGrades(searchGradeInput.value);
            gradeForm.reset();
        });

        window.editGrade = function(id) {
            const grade = grados.find(g => g.ID_Grado === id);
            document.getElementById('nombre-grado').value = grade.Nombre;
            deleteGrade(id);
        };

        window.deleteGrade = function(id) {
            grados = grados.filter(g => g.ID_Grado !== id);
            renderGrades(searchGradeInput.value);
        };

        yearForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newYear = {
                ID_AnioEscolar: aniosEscolares.length + 1,
                Anio: document.getElementById('anio-escolar').value
            };
            aniosEscolares.push(newYear);
            renderYears(searchYearInput.value);
            yearForm.reset();
        });

        window.editYear = function(id) {
            const year = aniosEscolares.find(y => y.ID_AnioEscolar === id);
            document.getElementById('anio-escolar').value = year.Anio;
            deleteYear(id);
        };

        window.deleteYear = function(id) {
            aniosEscolares = aniosEscolares.filter(y => y.ID_AnioEscolar !== id);
            renderYears(searchYearInput.value);
        };

        teacherForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newTeacher = {
                ID_Docente: docentes.length + 1,
                Nombre: document.getElementById('nombre-docente').value,
                Apellido: document.getElementById('apellido-docente').value,
                Cedula: document.getElementById('cedula-docente').value,
                Correo: document.getElementById('correo-docente').value,
                Contrasena: document.getElementById('contrasena-docente').value
            };
            docentes.push(newTeacher);
            renderTeachers(searchTeacherInput.value);
            teacherForm.reset();
        });

        window.editTeacher = function(id) {
            const teacher = docentes.find(t => t.ID_Docente === id);
            document.getElementById('nombre-docente').value = teacher.Nombre;
            document.getElementById('apellido-docente').value = teacher.Apellido;
            document.getElementById('cedula-docente').value = teacher.Cedula;
            document.getElementById('correo-docente').value = teacher.Correo;
            document.getElementById('contrasena-docente').value = teacher.Contrasena;
            deleteTeacher(id);
        };

        window.deleteTeacher = function(id) {
            docentes = docentes.filter(t => t.ID_Docente !== id);
            renderTeachers(searchTeacherInput.value);
        };

        subjectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newSubject = {
                ID_Asignatura: asignaturas.length + 1,
                Nombre: document.getElementById('nombre-asignatura').value
            };
            asignaturas.push(newSubject);
            renderSubjects(searchSubjectInput.value);
            subjectForm.reset();
        });

        window.editSubject = function(id) {
            const subject = asignaturas.find(s => s.ID_Asignatura === id);
            document.getElementById('nombre-asignatura').value = subject.Nombre;
            deleteSubject(id);
        };

        window.deleteSubject = function(id) {
            asignaturas = asignaturas.filter(s => s.ID_Asignatura !== id);
            renderSubjects(searchSubjectInput.value);
        };

        searchGradeInput.addEventListener('input', () => {
            renderGrades(searchGradeInput.value);
        });

        searchYearInput.addEventListener('input', () => {
            renderYears(searchYearInput.value);
        });

        searchTeacherInput.addEventListener('input', () => {
            renderTeachers(searchTeacherInput.value);
        });

        searchSubjectInput.addEventListener('input', () => {
            renderSubjects(searchSubjectInput.value);
        });

        renderGrades();
        renderYears();
        renderTeachers();
        renderSubjects();
    }

    // Lógica para informes
    if (path.includes('informes')) {
        const studentsTable = document.querySelector('#students-table tbody');
        const calificationsTable = document.querySelector('#califications-table tbody');
        const attendanceTable = document.querySelector('#attendance-table tbody');
        const gradoFiltro = document.getElementById('grado-filtro');
        const anioFiltro = document.getElementById('anio-filtro');
        const searchCalifInput = document.getElementById('search-calif');
        const searchAsistInput = document.getElementById('search-asist');

        function loadFiltros() {
            gradoFiltro.innerHTML = '<option value="">Todos</option>';
            grados.forEach(grado => {
                const option = document.createElement('option');
                option.value = grado.Nombre;
                option.textContent = grado.Nombre;
                gradoFiltro.appendChild(option);
            });

            anioFiltro.innerHTML = '<option value="">Todos</option>';
            aniosEscolares.forEach(anio => {
                const option = document.createElement('option');
                option.value = anio.Anio;
                option.textContent = anio.Anio;
                anioFiltro.appendChild(option);
            });
        }

        function renderStudentsInforme(grado = '', anio = '') {
            studentsTable.innerHTML = '';
            let filtered = inscripciones.map(ins => {
                const est = estudiantes.find(e => e.ID_Estudiante === ins.ID_Estudiante);
                const gradoObj = grados.find(g => g.ID_Grado === ins.ID_Grado);
                const anioObj = aniosEscolares.find(a => a.ID_AnioEscolar === ins.ID_AnioEscolar);
                return {
                    estudiante: est ? `${est.Nombre} ${est.Apellido}` : 'N/A',
                    grado: gradoObj ? gradoObj.Nombre : 'N/A',
                    anio: anioObj ? anioObj.Anio : 'N/A',
                    estado: ins.Estado
                };
            });
            if (grado) filtered = filtered.filter(ins => ins.grado === grado);
            if (anio) filtered = filtered.filter(ins => ins.anio === anio);
            filtered.forEach(ins => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="table__td">${ins.estudiante}</td>
                    <td class="table__td">${ins.grado}</td>
                    <td class="table__td">${ins.anio}</td>
                    <td class="table__td">${ins.estado}</td>
                `;
                studentsTable.appendChild(row);
            });
        }

        function renderCalificationsInforme(filter = '') {
            calificationsTable.innerHTML = '';
            let filtered = calificaciones.filter(cal =>
                cal.estudiante.toLowerCase().includes(filter.toLowerCase()) ||
                estudiantes.find(e => e.ID_Estudiante === cal.idEstudiante)?.Cedula.includes(filter)
            );
            filtered.forEach(cal => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="table__td">${cal.estudiante}</td>
                    <td class="table__td">${cal.asignatura}</td>
                    <td class="table__td">${cal.grado}</td>
                    <td class="table__td">${cal.anioEscolar}</td>
                    <td class="table__td">${cal.calificacion}</td>
                    <td class="table__td">${cal.observacion || ''}</td>
                `;
                calificationsTable.appendChild(row);
            });
        }

        function renderAttendanceInforme(filter = '') {
            attendanceTable.innerHTML = '';
            let filtered = asistencias.filter(att =>
                att.estudiante.toLowerCase().includes(filter.toLowerCase()) ||
                estudiantes.find(e => e.ID_Estudiante === att.idEstudiante)?.Cedula.includes(filter)
            );
            filtered.forEach(att => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="table__td">${att.estudiante}</td>
                    <td class="table__td">${att.anioEscolar}</td>
                    <td class="table__td">${att.fecha}</td>
                    <td class="table__td">${att.estado}</td>
                `;
                attendanceTable.appendChild(row);
            });
        }

        window.filterStudents = function() {
            renderStudentsInforme(gradoFiltro.value, anioFiltro.value);
        };

        searchCalifInput.addEventListener('input', () => {
            renderCalificationsInforme(searchCalifInput.value);
        });

        searchAsistInput.addEventListener('input', () => {
            renderAttendanceInforme(searchAsistInput.value);
        });

        window.generatePDF = function() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const today = new Date().toISOString().slice(0, 10);
            let y = 20;

            // Título
            doc.setFontSize(16);
            doc.text('Informe Académico - Escuela Isaías 29:18', 20, y);
            y += 10;

            // Calificaciones
            doc.setFontSize(12);
            doc.text('Calificaciones por Estudiante', 20, y);
            y += 10;
            const califData = Array.from(calificationsTable.querySelectorAll('tr')).map(row => 
                Array.from(row.cells).map(cell => cell.textContent)
            );
            doc.autoTable({
                startY: y,
                head: [['Estudiante', 'Asignatura', 'Grado', 'Año', 'Calificación', 'Observación']],
                body: califData,
                styles: { fontSize: 10 }
            });
            y = doc.lastAutoTable.finalY + 10;

            // Asistencias
            doc.text('Asistencias por Estudiante', 20, y);
            y += 10;
            const asistData = Array.from(attendanceTable.querySelectorAll('tr')).map(row => 
                Array.from(row.cells).map(cell => cell.textContent)
            );
            doc.autoTable({
                startY: y,
                head: [['Estudiante', 'Año', 'Fecha', 'Estado']],
                body: asistData,
                styles: { fontSize: 10 }
            });
            y = doc.lastAutoTable.finalY + 10;

            // Resumen
            doc.text('Resumen', 20, y);
            y += 10;
            const avgCal = calificaciones.length > 0 ? (calificaciones.reduce((sum, cal) => sum + cal.calificacion, 0) / calificaciones.length).toFixed(2) : 0;
            const attendanceSummary = {};
            asistencias.forEach(att => {
                if (!attendanceSummary[att.idEstudiante]) {
                    attendanceSummary[att.idEstudiante] = { asistencias: 0, faltas: 0 };
                }
                if (att.estado === 'Asistencia') {
                    attendanceSummary[att.idEstudiante].asistencias += 1;
                } else {
                    attendanceSummary[att.idEstudiante].faltas += 1;
                }
            });
            const summaryData = Object.entries(attendanceSummary).map(([id, data]) => {
                const est = estudiantes.find(e => e.ID_Estudiante === parseInt(id));
                const total = data.asistencias + data.faltas;
                const porcentaje = total > 0 ? Math.round((data.asistencias / total) * 100) : 0;
                return [est ? `${est.Nombre} ${est.Apellido}` : 'N/A', data.asistencias, data.faltas, `${porcentaje}%`];
            });
            doc.autoTable({
                startY: y,
                head: [['Estudiante', 'Asistencias', 'Faltas', 'Porcentaje']],
                body: summaryData,
                styles: { fontSize: 10 }
            });
            y = doc.lastAutoTable.finalY + 10;

            doc.text(`Promedio General de Calificaciones: ${avgCal}`, 20, y);

            // Guardar PDF
            const filterEst = searchCalifInput.value || 'General';
            doc.save(`Informe_${filterEst}_${today}.pdf`);
        };

        loadFiltros();
        renderStudentsInforme();
        renderCalificationsInforme();
        renderAttendanceInforme();
    }

    // Lógica para el menú hamburguesa
    const menuToggle = document.querySelector('.header__menu-toggle');
    const navLinks = document.querySelector('.header__nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('header__nav-links--active');
        });
    }
});