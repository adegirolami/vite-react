'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { Users, CalendarCheck, UserCheck, DollarSign, Banknote, TrendingDown, TrendingUp } from 'lucide-react'

const benchmarks = {
  Agendadas: 10.5,
  Asistidas: 47,
  Vendidas: 41,
  CostoPorVenta: 80000
}

const getColor = (actual, benchmark) => {
  const diff = (actual - benchmark) / benchmark
  if (diff >= 0.3) return '#22C55E' // Verde para 30% o más por encima
  if (diff >= 0.1) return '#10B981' // Verde claro para 10-30% por encima
  if (diff > -0.1) return '#6B7280' // Gris para ±10% del benchmark
  if (diff > -0.3) return '#EF4444' // Rojo claro para 10-30% por debajo
  return '#DC2626' // Rojo para 30% o más por debajo
}

const getPerformanceText = (actual, benchmark) => {
  const diff = (actual - benchmark) / benchmark
  if (diff >= 0.3) return 'Muy por encima del benchmark'
  if (diff >= 0.1) return 'Por encima del benchmark'
  if (diff > -0.1) return 'Cerca del benchmark'
  if (diff > -0.3) return 'Por debajo del benchmark'
  return 'Muy por debajo del benchmark'
}

const formatNumber = (number) => {
  return new Intl.NumberFormat('es-AR').format(number)
}

const formatCurrency = (number) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(number).replace('ARS', '$')
}

export default function Component() {
  const [datos, setDatos] = useState({
    inversion: '',
    contactos: '',
    agendadas: '',
    asistidas: '',
    vendidas: ''
  })

  const [datosGrafico, setDatosGrafico] = useState([])
  const [costoPorVendida, setCostoPorVendida] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const numericValue = value.replace(/\D/g, '')
    const formattedValue = numericValue ? formatNumber(parseInt(numericValue)) : ''
    setDatos(prevDatos => ({
      ...prevDatos,
      [name]: formattedValue
    }))
  }

  const calcularDatosGrafico = () => {
    const inversion = parseInt(datos.inversion.replace(/\D/g, '')) || 0
    const contactos = parseInt(datos.contactos.replace(/\D/g, '')) || 0
    const agendadas = parseInt(datos.agendadas.replace(/\D/g, '')) || 0
    const asistidas = parseInt(datos.asistidas.replace(/\D/g, '')) || 0
    const vendidas = parseInt(datos.vendidas.replace(/\D/g, '')) || 0

    const tasaAgendadas = contactos > 0 ? (agendadas / contactos) * 100 : 0
    const tasaAsistidas = agendadas > 0 ? (asistidas / agendadas) * 100 : 0
    const tasaVendidas = asistidas > 0 ? (vendidas / asistidas) * 100 : 0

    setDatosGrafico([
      { nombre: 'Contactos', total: contactos, tasa: null, benchmark: null, color: '#6B7280' },
      { nombre: 'Agendadas', total: agendadas, tasa: tasaAgendadas.toFixed(2), benchmark: benchmarks.Agendadas, color: getColor(tasaAgendadas, benchmarks.Agendadas) },
      { nombre: 'Asistidas', total: asistidas, tasa: tasaAsistidas.toFixed(2), benchmark: benchmarks.Asistidas, color: getColor(tasaAsistidas, benchmarks.Asistidas) },
      { nombre: 'Vendidas', total: vendidas, tasa: tasaVendidas.toFixed(2), benchmark: benchmarks.Vendidas, color: getColor(tasaVendidas, benchmarks.Vendidas) }
    ])

    const costoPorVendidaCalculado = vendidas > 0 ? inversion / vendidas : 0
    setCostoPorVendida(costoPorVendidaCalculado)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border p-2 shadow-md">
          <p className="font-bold">{`${label}`}</p>
          <p>{`Total: ${formatNumber(data.total)}`}</p>
          {data.tasa !== null && (
            <>
              <p>{`Tasa de conversión: ${data.tasa}%`}</p>
              <p>{`Benchmark: ${data.benchmark}%`}</p>
              <p style={{ color: data.color }}>{getPerformanceText(parseFloat(data.tasa), data.benchmark)}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Embudo de Ventas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Input
            type="text"
            name="inversion"
            value={datos.inversion}
            onChange={handleInputChange}
            placeholder="Inversión"
            aria-label="Ingrese el monto de inversión"
          />
          <Input
            type="text"
            name="contactos"
            value={datos.contactos}
            onChange={handleInputChange}
            placeholder="Contactos"
            aria-label="Ingrese el número de contactos"
          />
          <Input
            type="text"
            name="agendadas"
            value={datos.agendadas}
            onChange={handleInputChange}
            placeholder="Agendadas"
            aria-label="Ingrese el número de citas agendadas"
          />
          <Input
            type="text"
            name="asistidas"
            value={datos.asistidas}
            onChange={handleInputChange}
            placeholder="Asistidas"
            aria-label="Ingrese el número de citas asistidas"
          />
          <Input
            type="text"
            name="vendidas"
            value={datos.vendidas}
            onChange={handleInputChange}
            placeholder="Vendidas"
            aria-label="Ingrese el número de ventas realizadas"
          />
        </div>
        <Button onClick={calcularDatosGrafico} className="w-full mb-6">Calcular 🚀</Button>
        
        {datosGrafico.length > 0 && (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={datosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis tickFormatter={(value) => formatNumber(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#374151">
                  <LabelList
                    dataKey="tasa"
                    position="top"
                    content={({ x, y, width, value, color }) => (
                      value !== null ? (
                        <text
                          x={x + width / 2}
                          y={y - 10}
                          fill={color}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontWeight="bold"
                          fontSize="14"
                        >
                          {`${value}%`}
                        </text>
                      ) : null
                    )}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarCheck className="h-5 w-5" />
                <span>Benchmark Agendadas: 10,50%</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserCheck className="h-5 w-5" />
                <span>Benchmark Asistidas: 47,00%</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-5 w-5" />
                <span>Benchmark Vendidas: 41,00%</span>
              </div>
            </div>

            {costoPorVendida !== null && (
              <div className="mt-6 p-6 bg-muted rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-primary">Análisis de Costos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="text-lg font-medium mb-2 text-gray-700">Costo por Venta Actual</h4>
                    <div className="flex items-center justify-between">
                      <Banknote className="h-8 w-8 text-primary" />
                      <span className="text-2xl font-bold">{formatCurrency(costoPorVendida)}</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="text-lg font-medium mb-2 text-gray-700">Costo por Venta Objetivo</h4>
                    <div className="flex items-center justify-between">
                      <DollarSign className="h-8 w-8 text-primary" />
                      <span className="text-2xl font-bold">{formatCurrency(benchmarks.CostoPorVenta)}</span>
                    </div>
                  </div>
                </div>
                <div className={`mt-4 p-4 rounded-lg ${costoPorVendida <= benchmarks.CostoPorVenta ? 'bg-green-100' : 'bg-red-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">
                      {costoPorVendida <= benchmarks.CostoPorVenta ? 'Por debajo del objetivo' : 'Por encima del objetivo'}
                    </span>
                    {costoPorVendida <= benchmarks.CostoPorVenta ? (
                      <TrendingDown className="h-6 w-6 text-green-600" />
                    ) : (
                      <TrendingUp className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <p className="mt-2 text-sm">
                    {costoPorVendida <= benchmarks.CostoPorVenta
                      ? `El costo por venta está ${formatCurrency(Math.abs(benchmarks.CostoPorVenta - costoPorVendida))} por debajo del objetivo.`
                      : `El costo por venta está ${formatCurrency(Math.abs(costoPorVendida - benchmarks.CostoPorVenta))} por encima del objetivo.`}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
