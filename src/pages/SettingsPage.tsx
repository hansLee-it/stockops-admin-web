/**
 * Settings page with tabbed navigation for system configuration.
 * Provides UI for general settings, user management, permissions, notifications, API, and backup.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Users, Shield, Bell, Key, Database, ChevronRight, Plus } from 'lucide-react'

type TabId = 'general' | 'users' | 'permissions' | 'notifications' | 'api' | 'backup'

interface Tab {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const tabs: Tab[] = [
  { id: 'general', label: '일반', icon: Settings },
  { id: 'users', label: '사용자 관리', icon: Users },
  { id: 'permissions', label: '권한 설정', icon: Shield },
  { id: 'notifications', label: '알림', icon: Bell },
  { id: 'api', label: 'API & 연동', icon: Key },
  { id: 'backup', label: '백업 & 복구', icon: Database },
]

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('general')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">설정</h1>
        <p className="text-text-secondary mt-1">시스템 설정 및 관리를 확인하세요.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 shrink-0">
          <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 bg-white rounded-xl border border-neutral-200 p-2 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3 min-h-[44px] rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-text-secondary hover:bg-neutral-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto hidden lg:block" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-neutral-200 p-6">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'users' && <UsersSettings />}
          {activeTab === 'permissions' && <PermissionsSettings />}
          {activeTab === 'notifications' && <NotificationsSettings />}
          {activeTab === 'api' && <ApiSettings />}
          {activeTab === 'backup' && <BackupSettings />}
        </div>
      </div>
    </div>
  )
}

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">일반 설정</h2>

      <div className="space-y-4">
        <div className="form-section">
          <h3 className="text-sm font-medium text-text-secondary mb-3">창고 정보</h3>
          <p className="mb-4 text-sm text-text-secondary">
            실제 센터 정보는 연동된 운영 데이터에서 불러옵니다. 이 화면에서는 비어 있는 항목만 표시합니다.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">창고명</label>
              <input
                type="text"
                defaultValue=""
                placeholder="연동된 창고명이 표시됩니다"
                className="w-full px-3 py-2 min-h-[44px] text-base border border-neutral-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">창고 ID</label>
              <input
                type="text"
                defaultValue=""
                placeholder="연동된 창고 ID가 표시됩니다"
                readOnly
                className="w-full px-3 py-2 min-h-[44px] text-base border border-neutral-200 rounded-lg bg-neutral-50"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">주소</label>
              <input
                type="text"
                defaultValue=""
                placeholder="연동된 주소가 표시됩니다"
                className="w-full px-3 py-2 min-h-[44px] text-base border border-neutral-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="text-sm font-medium text-text-secondary mb-3">시스템 설정</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">언어</label>
              <select className="w-full px-3 py-2 min-h-[44px] text-base border border-neutral-300 rounded-lg">
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">시간대</label>
              <select className="w-full px-3 py-2 min-h-[44px] text-base border border-neutral-300 rounded-lg">
                <option value="Asia/Seoul">Asia/Seoul (GMT+9)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-neutral-200">
          <button type="button" className="px-4 py-2 min-h-[44px] border border-neutral-300 rounded-lg hover:bg-neutral-50">초기화</button>
          <button type="button" className="px-4 py-2 min-h-[44px] bg-primary-600 text-white rounded-lg hover:bg-primary-700">저장</button>
        </div>
      </div>
    </div>
  )
}

function UsersSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">사용자 관리</h2>
        <button type="button" className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-4 h-4" />
          사용자 추가
        </button>
      </div>

      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
        <p className="font-medium text-text-primary">연결된 사용자 목록이 없습니다.</p>
        <p className="mt-2 text-sm text-text-secondary">
          사용자 목록은 실제 계정 연동 후 표시됩니다. 이 화면에서는 임시 사용자 데이터를 보여주지 않습니다.
        </p>
      </div>
    </div>
  )
}

function PermissionsSettings() {
  const features = ['재고 조회', '재고 수정', '입출고 등록', '재고 조정', '사용자 관리', '설정 변경']
  const roles = ['점주', '창고관리자', '직원', '감사자']

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">권한 설정</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">기능</th>
              {roles.map((role) => (
                <th key={role} className="text-center py-3 px-4 text-sm font-medium text-text-secondary">{role}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr key={feature} className="border-b border-neutral-100">
                <td className="py-3 px-4 text-text-primary">{feature}</td>
                {roles.map((_, roleIdx) => (
                  <td key={roleIdx} className="text-center py-3 px-4">
                    <input
                      type="checkbox"
                      disabled={roleIdx === 0}
                      defaultChecked={roleIdx === 0 || roleIdx === 1}
                      className="w-4 h-4 rounded"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-4 border-t border-neutral-200">
        <button type="button" className="px-4 py-2 min-h-[44px] bg-primary-600 text-white rounded-lg hover:bg-primary-700">권한 저장</button>
      </div>
    </div>
  )
}

function NotificationsSettings() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">알림 설정</h2>

      <div className="space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">알림 채널 상세 설정</h3>
              <p className="text-sm text-blue-700 mt-1">알림 유형별로 SMS, 이메일, 웹훅 채널을 설정하세요.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/settings/notification-channels')}
              className="px-4 py-2 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              채널 설정 관리
            </button>
          </div>
        </div>

        <div className="form-section">
          <h3 className="text-sm font-medium text-text-secondary mb-3">알림 채널</h3>
          <div className="space-y-2">
            {['앱 푸시 알림', '이메일 알림', 'SMS 알림'].map((channel, idx) => (
              <label key={channel} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100">
                <input type="checkbox" defaultChecked={idx < 2} className="w-4 h-4 rounded" />
                <span className="text-text-primary">{channel}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3 className="text-sm font-medium text-text-secondary mb-3">알림 유형</h3>
          <div className="space-y-2">
            {['재고 부족 알림', '유통기한 임박 알림', '환경 이상 알림', 'AI 발주 제안 알림'].map((type, idx) => (
              <label key={type} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100">
                <input type="checkbox" defaultChecked={idx < 3} className="w-4 h-4 rounded" />
                <span className="text-text-primary">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-200">
          <button type="button" className="px-4 py-2 min-h-[44px] bg-primary-600 text-white rounded-lg hover:bg-primary-700">저장</button>
        </div>
      </div>
    </div>
  )
}

function ApiSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">API 및 연동</h2>

      <div className="space-y-4">
        <div className="form-section">
          <h3 className="text-sm font-medium text-text-secondary mb-3">API 키</h3>
          <div className="space-y-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <p className="font-medium text-text-primary">운영 API 키</p>
              <p className="mt-1 text-sm text-text-secondary">보안상 이 화면에는 키 값을 표시하지 않습니다. 연동된 키가 있으면 관리 화면에서 확인합니다.</p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <p className="font-medium text-text-primary">테스트 API 키</p>
              <p className="mt-1 text-sm text-text-secondary">현재 등록된 테스트 키가 없습니다. 테스트 연동이 완료되면 상태가 표시됩니다.</p>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="text-sm font-medium text-text-secondary mb-3">외부 연동</h3>
          <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4">
            <p className="font-medium text-text-primary">연결된 외부 알림 서비스가 없습니다.</p>
            <p className="mt-1 text-sm text-text-secondary">
              외부 메신저 또는 협업 도구는 실제 연동이 완료된 뒤에만 표시합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function BackupSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">백업 및 복구</h2>

      <div className="space-y-6">
        <div className="p-4 bg-neutral-50 rounded-lg">
          <h3 className="text-sm font-medium text-text-secondary mb-3">자동 백업</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-text-light">마지막 백업</p>
              <p className="font-medium">연동 안 됨</p>
            </div>
            <div>
              <p className="text-xs text-text-light">다음 백업</p>
              <p className="font-medium">예약 없음</p>
            </div>
            <div>
              <p className="text-xs text-text-light">백업 주기</p>
              <p className="font-medium">미설정</p>
            </div>
          </div>
          <p className="mb-4 text-sm text-text-secondary">
            백업 서비스가 연결되지 않아 기록이 비어 있습니다. 실제 자동 백업이 설정되면 이 영역에 최신 상태가 표시됩니다.
          </p>
          <div className="flex gap-2">
            <button type="button" className="px-4 py-2 min-h-[44px] bg-primary-600 text-white rounded-lg hover:bg-primary-700">백업 연동</button>
            <button type="button" className="px-4 py-2 min-h-[44px] border border-neutral-300 rounded-lg hover:bg-neutral-100">연동 안내</button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-3">백업 이력</h3>
          <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-text-secondary">
            백업 기록이 없습니다. 연결된 백업 서비스에서 생성된 내역만 표시됩니다.
          </div>
        </div>
      </div>
    </div>
  )
}
