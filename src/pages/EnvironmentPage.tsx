/**
 * Environment monitoring page for IoT sensor data.
 * Displays temperature, humidity, and sensor status with alerts and charts.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { useState } from 'react'
import { Thermometer, Droplets, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface Sensor {
  id: string
  name: string
  location: string
  value: string
  unit: string
  range: string
  status: 'normal' | 'warning' | 'danger'
  lastUpdate: string
}

const mockSensors: Sensor[] = [
  { id: 'TEMP-001', name: '온도', location: '냉장고 A', value: '5.8', unit: '°C', range: '2°C ~ 5°C', status: 'danger', lastUpdate: '1분 전' },
  { id: 'TEMP-002', name: '온도', location: '냉장고 B', value: '3.5', unit: '°C', range: '2°C ~ 5°C', status: 'normal', lastUpdate: '1분 전' },
  { id: 'TEMP-003', name: '온도', location: '냉동고 A', value: '-18.5', unit: '°C', range: '-20°C ~ -15°C', status: 'normal', lastUpdate: '2분 전' },
  { id: 'HUM-001', name: '습도', location: '창고 전체', value: '65', unit: '%', range: '50% ~ 70%', status: 'normal', lastUpdate: '1분 전' },
  { id: 'DOOR-001', name: '문 센서', location: '냉장고 A 문', value: '열림', unit: '', range: '-', status: 'danger', lastUpdate: '5분 전' },
]

const mockAlerts = [
  { time: '13:05', type: 'danger', message: '냉장고 A 온도 상승 (8°C → 5.8°C)', user: '자동 감지', action: '조치 완료' },
  { time: '13:00', type: 'warning', message: '냉장고 A 문 개방 감지', user: '센서 DOOR-001', action: '에스컬레이션' },
  { time: '09:30', type: 'normal', message: '냉장고 B 조치 완료 (온도 정상화)', user: '이직원', action: null },
]

export function EnvironmentPage() {
  const [sensors] = useState<Sensor[]>(mockSensors)
  const [loading, setLoading] = useState(false)

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  const getStatusBadge = (status: Sensor['status']) => {
    switch (status) {
      case 'normal':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-success/10 text-success rounded"><CheckCircle className="w-3 h-3" />정상</span>
      case 'warning':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-warning/10 text-warning rounded"><AlertTriangle className="w-3 h-3" />주의</span>
      case 'danger':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-error/10 text-error rounded"><XCircle className="w-3 h-3" />이상</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">🌡️ 환경 모니터링</h1>
          <p className="text-text-secondary mt-1">IoT 센서 현황을 실시간으로 확인하세요.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50">
            📊 리포트 다운로드
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SensorCard icon={<Thermometer className="w-6 h-6" />} name="온도" value="4.2°C" range="목표: 2°C ~ 5°C" status="normal" />
        <SensorCard icon={<Droplets className="w-6 h-6" />} name="습도" value="65%" range="목표: 50% ~ 70%" status="normal" />
        <SensorCard icon={<Thermometer className="w-6 h-6" />} name="냉장고 A" value="5.8°C" range="목표: 2°C ~ 5°C" status="danger" />
        <SensorCard icon={<Thermometer className="w-6 h-6" />} name="냉동고 B" value="-18.5°C" range="목표: -20°C ~ -15°C" status="normal" />
      </div>

      {sensors.some(s => s.status === 'danger') && (
        <div className="bg-error/5 border border-error/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-error">🔴 긴급 알림</h3>
              <p className="text-sm text-text-secondary mt-1">냉장고 A 온도 상승 (5.8°C) - 문 개방 감지</p>
              <p className="text-xs text-text-light mt-1">5분 전 발생 • 미조치</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm bg-error text-white rounded hover:bg-error/90">조치 완료</button>
              <button className="px-3 py-1.5 text-sm border border-neutral-300 rounded hover:bg-neutral-100">에스컬레이션</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold mb-4">📈 실시간 온도 추이 (24시간)</h3>
          <div className="h-48 bg-neutral-50 rounded-lg flex items-center justify-center text-text-light">
            [차트 영역 - Phase 2에서 차트 라이브러리 연동]
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold mb-4">💧 습도 변화 (24시간)</h3>
          <div className="h-48 bg-neutral-50 rounded-lg flex items-center justify-center text-text-light">
            [차트 영역 - Phase 2에서 차트 라이브러리 연동]
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold mb-4">📍 센서 상세 현황</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">센서명</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">위치</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">현재값</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">설정범위</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">상태</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">최종 갱신</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">관리</th>
              </tr>
            </thead>
            <tbody>
              {sensors.map((sensor) => (
                <tr key={sensor.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 px-4 font-medium">{sensor.id}</td>
                  <td className="py-3 px-4 text-text-secondary">{sensor.location}</td>
                  <td className="py-3 px-4 font-medium">{sensor.value}{sensor.unit}</td>
                  <td className="py-3 px-4 text-text-secondary">{sensor.range}</td>
                  <td className="py-3 px-4">{getStatusBadge(sensor.status)}</td>
                  <td className="py-3 px-4 text-text-light text-sm">{sensor.lastUpdate}</td>
                  <td className="py-3 px-4">
                    <button className="px-3 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-100">설정</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold mb-4">📋 최근 알림 이력</h3>
        <div className="space-y-2">
          {mockAlerts.map((alert, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
              <span className="text-sm text-text-light min-w-[50px]">{alert.time}</span>
              <span className={`px-2 py-0.5 text-xs rounded ${
                alert.type === 'danger' ? 'bg-error/10 text-error' :
                alert.type === 'warning' ? 'bg-warning/10 text-warning' :
                'bg-success/10 text-success'
              }`}>
                {alert.type === 'danger' ? '경보' : alert.type === 'warning' ? '주의' : '정상'}
              </span>
              <span className="flex-1 text-sm">{alert.message}</span>
              <span className="text-xs text-text-light">{alert.user}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SensorCard({ icon, name, value, range, status }: {
  icon: React.ReactNode
  name: string
  value: string
  range: string
  status: 'normal' | 'warning' | 'danger'
}) {
  const statusClasses = {
    normal: 'border-success bg-success/5',
    warning: 'border-warning bg-warning/5',
    danger: 'border-error bg-error/5',
  }

  return (
    <div className={`bg-white p-6 rounded-xl border-2 ${statusClasses[status]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-secondary text-sm">{name}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-light mt-1">{range}</p>
    </div>
  )
}
