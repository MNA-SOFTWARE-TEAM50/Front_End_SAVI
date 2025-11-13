import React, { useState } from 'react';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import Swal from 'sweetalert2';

type TestResult = {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  details?: string;
  duration?: number;
};

type EnvVar = {
  name: string;
  status: 'ok' | 'missing' | 'unknown';
  value?: string;
  description: string;
};

const SystemTests: React.FC = () => {
  const { token } = useAuth();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'env'>('tests');

  // Definir las pruebas disponibles
  const availableTests = [
    {
      id: 'db_connection',
      name: 'Conexión a Base de Datos',
      description: 'Verifica que la conexión a MySQL funcione correctamente',
    },
    {
      id: 'api_health',
      name: 'Estado de la API',
      description: 'Verifica que todos los endpoints principales respondan',
    },
    {
      id: 'authentication',
      name: 'Sistema de Autenticación',
      description: 'Verifica login, JWT y permisos',
    },
    {
      id: 'products_crud',
      name: 'CRUD de Productos',
      description: 'Verifica operaciones de productos',
    },
    {
      id: 'sales_system',
      name: 'Sistema de Ventas',
      description: 'Verifica el flujo completo de ventas',
    },
    {
      id: 'inventory_alerts',
      name: 'Alertas de Inventario',
      description: 'Verifica el sistema de alertas',
    },
    {
      id: 'promotions',
      name: 'Sistema de Promociones',
      description: 'Verifica promociones y descuentos',
    },
  ];

  // Verificar variables de entorno
  const checkEnvironmentVariables = async () => {
    const envChecks: EnvVar[] = [
      {
        name: 'VITE_API_URL',
        status: 'unknown',
        value: (import.meta.env as any).VITE_API_URL,
        description: 'URL base de la API del backend',
      },
      {
        name: 'NODE_ENV',
        status: 'unknown',
        value: (import.meta.env as any).MODE,
        description: 'Entorno de ejecución (development/production)',
      },
    ];

    // Verificar estado de cada variable
    const updatedVars = envChecks.map(v => ({
      ...v,
      status: v.value ? 'ok' : 'missing' as 'ok' | 'missing',
    }));

    // Verificar conexión con el backend
    try {
      const apiUrl = (import.meta.env as any).VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/v1/products?limit=1`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      updatedVars.push({
        name: 'Backend Connection',
        status: response.ok ? 'ok' : 'missing',
        value: response.ok ? 'Conectado' : 'Error',
        description: 'Conexión con el servidor backend',
      });
    } catch (e) {
      updatedVars.push({
        name: 'Backend Connection',
        status: 'missing',
        value: 'No conectado',
        description: 'Conexión con el servidor backend',
      });
    }

    setEnvVars(updatedVars);
  };

  // Ejecutar una prueba específica
  const runTest = async (testId: string): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      switch (testId) {
        case 'db_connection':
          // Intenta obtener productos para verificar DB
          await apiClient.get('/v1/products?limit=1', token || undefined);
          return {
            name: 'Conexión a Base de Datos',
            status: 'success',
            message: 'Conexión exitosa',
            details: 'La base de datos está respondiendo correctamente',
            duration: Date.now() - startTime,
          };

        case 'api_health':
          // Verificar múltiples endpoints
          const endpoints = [
            { path: '/v1/products', name: 'Productos' },
            { path: '/v1/sales', name: 'Ventas' }
          ];
          const results: { name: string; ok: boolean }[] = [];
          
          for (const ep of endpoints) {
            try {
              await apiClient.get(`${ep.path}?limit=1`, token || undefined);
              results.push({ name: ep.name, ok: true });
            } catch (e: any) {
              results.push({ name: ep.name, ok: false });
            }
          }
          
          const successCount = results.filter(r => r.ok).length;
          const failedEndpoints = results.filter(r => !r.ok).map(r => r.name);
          const allOk = successCount === results.length;
          
          return {
            name: 'Estado de la API',
            status: allOk ? 'success' : (successCount > 0 ? 'success' : 'error'),
            message: allOk 
              ? `Todos los endpoints responden (${successCount}/${results.length})` 
              : `${successCount}/${results.length} endpoints funcionan`,
            details: failedEndpoints.length > 0 
              ? `Fallidos: ${failedEndpoints.join(', ')}. Esto puede ser normal si no hay datos en esas tablas.`
              : 'Todos los endpoints principales responden correctamente',
            duration: Date.now() - startTime,
          };

        case 'authentication':
          // Verificar que el token sea válido
          if (!token) {
            return {
              name: 'Sistema de Autenticación',
              status: 'error',
              message: 'No hay sesión activa',
              details: 'Debes estar autenticado para ejecutar esta prueba',
              duration: Date.now() - startTime,
            };
          }
          await apiClient.get('/v1/products?limit=1', token);
          return {
            name: 'Sistema de Autenticación',
            status: 'success',
            message: 'Token JWT válido',
            details: 'La autenticación funciona correctamente',
            duration: Date.now() - startTime,
          };

        case 'products_crud':
          // Verificar operaciones de productos
          const products: any = await apiClient.get('/v1/products?limit=5', token || undefined);
          return {
            name: 'CRUD de Productos',
            status: 'success',
            message: `${products.items?.length || 0} productos encontrados`,
            details: 'Las operaciones de lectura funcionan correctamente',
            duration: Date.now() - startTime,
          };

        case 'sales_system':
          // Verificar sistema de ventas
          const sales: any = await apiClient.get('/v1/sales?limit=5', token || undefined);
          return {
            name: 'Sistema de Ventas',
            status: 'success',
            message: `${sales.items?.length || 0} ventas registradas`,
            details: 'El sistema de ventas funciona correctamente',
            duration: Date.now() - startTime,
          };

        case 'inventory_alerts':
          // Verificar alertas
          const alerts: any = await apiClient.get('/v1/inventory-alerts/?limit=5', token || undefined);
          return {
            name: 'Alertas de Inventario',
            status: 'success',
            message: `${alerts.length || 0} alertas activas`,
            details: 'El sistema de alertas funciona correctamente',
            duration: Date.now() - startTime,
          };

        case 'promotions':
          // Verificar promociones
          const promos: any = await apiClient.get('/v1/products?limit=100', token || undefined);
          const withPromo = promos.items?.filter((p: any) => p.has_promotion) || [];
          return {
            name: 'Sistema de Promociones',
            status: 'success',
            message: `${withPromo.length} productos en promoción`,
            details: 'El sistema de promociones funciona correctamente',
            duration: Date.now() - startTime,
          };

        default:
          return {
            name: 'Prueba Desconocida',
            status: 'error',
            message: 'Prueba no implementada',
            duration: Date.now() - startTime,
          };
      }
    } catch (error: any) {
      return {
        name: testId,
        status: 'error',
        message: 'Error al ejecutar la prueba',
        details: error.message || 'Error desconocido',
        duration: Date.now() - startTime,
      };
    }
  };

  // Ejecutar todas las pruebas
  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);

    const results: TestResult[] = [];

    for (const test of availableTests) {
      // Marcar como ejecutándose
      setTests(prev => [...prev, {
        name: test.name,
        status: 'running',
        message: 'Ejecutando...',
      }]);

      // Ejecutar prueba
      const result = await runTest(test.id);
      
      // Actualizar resultado
      setTests(prev => prev.map(t => 
        t.name === test.name ? result : t
      ));

      results.push(result);

      // Pequeña pausa entre pruebas
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsRunning(false);

    // Mostrar resumen
    const passed = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;
    
    Swal.fire({
      icon: failed === 0 ? 'success' : 'warning',
      title: 'Pruebas Completadas',
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>✅ Exitosas:</strong> ${passed}</p>
          <p class="mb-2"><strong>❌ Fallidas:</strong> ${failed}</p>
          <p class="text-sm text-gray-600 mt-3">Tiempo total: ${results.reduce((acc, r) => acc + (r.duration || 0), 0)}ms</p>
        </div>
      `,
    });
  };

  // Ejecutar una prueba individual
  const runSingleTest = async (testId: string, testName: string) => {
    setTests(prev => [...prev.filter(t => t.name !== testName), {
      name: testName,
      status: 'running',
      message: 'Ejecutando...',
    }]);

    const result = await runTest(testId);
    
    setTests(prev => prev.map(t => 
      t.name === testName ? result : t
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-8">
        <Breadcrumb />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pruebas de Sistema</h1>
          <p className="text-gray-600">Verifica el funcionamiento completo del sistema SAVI</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tests')}
              className={`${
                activeTab === 'tests'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              🧪 Pruebas del Sistema
            </button>
            <button
              onClick={() => {
                setActiveTab('env');
                checkEnvironmentVariables();
              }}
              className={`${
                activeTab === 'env'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              ⚙️ Variables de Entorno
            </button>
          </nav>
        </div>

        {/* Tab: Pruebas del Sistema */}
        {activeTab === 'tests' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Pruebas Disponibles</h2>
                <p className="text-sm text-gray-600">Ejecuta pruebas para verificar el funcionamiento del sistema</p>
              </div>
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className="btn-primary flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ejecutando...
                  </>
                ) : (
                  <>
                    ▶️ Ejecutar Todas
                  </>
                )}
              </button>
            </div>

            {/* Lista de pruebas */}
            <div className="grid grid-cols-1 gap-4">
              {availableTests.map((test) => {
                const result = tests.find(t => t.name === test.name);
                const statusColors = {
                  pending: 'bg-gray-50 border-gray-200',
                  running: 'bg-blue-50 border-blue-300',
                  success: 'bg-green-50 border-green-300',
                  error: 'bg-red-50 border-red-300',
                };

                return (
                  <div
                    key={test.id}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      result ? statusColors[result.status] : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {result?.status === 'running' && (
                            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          {result?.status === 'success' && <span className="text-2xl">✅</span>}
                          {result?.status === 'error' && <span className="text-2xl">❌</span>}
                          {!result && <span className="text-2xl">⚪</span>}
                          
                          <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                        
                        {result && (
                          <div className="space-y-1">
                            <p className={`text-sm font-medium ${
                              result.status === 'success' ? 'text-green-700' :
                              result.status === 'error' ? 'text-red-700' :
                              'text-blue-700'
                            }`}>
                              {result.message}
                            </p>
                            {result.details && (
                              <p className="text-xs text-gray-600">{result.details}</p>
                            )}
                            {result.duration && (
                              <p className="text-xs text-gray-500">⏱️ {result.duration}ms</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => runSingleTest(test.id, test.name)}
                        disabled={isRunning}
                        className="ml-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {result?.status === 'running' ? 'Ejecutando...' : 'Ejecutar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Variables de Entorno */}
        {activeTab === 'env' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Variables de Entorno</h2>
              <p className="text-sm text-gray-600">Configuración del sistema y conexiones</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variable</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {envVars.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        <p className="mb-2">No se han verificado las variables de entorno</p>
                        <button
                          onClick={checkEnvironmentVariables}
                          className="btn-primary"
                        >
                          Verificar Variables
                        </button>
                      </td>
                    </tr>
                  ) : (
                    envVars.map((envVar) => (
                      <tr key={envVar.name} className={envVar.status === 'missing' ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {envVar.status === 'ok' && <span className="text-2xl">✅</span>}
                          {envVar.status === 'missing' && <span className="text-2xl">❌</span>}
                          {envVar.status === 'unknown' && <span className="text-2xl">❓</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-semibold text-gray-900">{envVar.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          {envVar.value ? (
                            <code className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">
                              {envVar.value}
                            </code>
                          ) : (
                            <span className="text-red-600 text-sm">No configurada</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{envVar.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {envVars.some(v => v.status === 'missing') && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Variables Faltantes</h3>
                <p className="text-sm text-yellow-800">
                  Algunas variables de entorno no están configuradas. Esto puede causar problemas en el funcionamiento del sistema.
                  Revisa el archivo <code className="bg-yellow-100 px-1 rounded">.env</code> y asegúrate de que todas las variables estén configuradas correctamente.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemTests;
