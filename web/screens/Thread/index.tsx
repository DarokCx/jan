import { useEffect, useState } from 'react'

import { useAtomValue } from 'jotai'

import ThreadLeftPanel from '@/screens/Thread/ThreadLeftPanel'

import { localEngines } from '@/utils/modelEngine'

import ThreadCenterPanel from './ThreadCenterPanel'
import OnDeviceStarterScreen from './ThreadCenterPanel/ChatBody/EmptyModel'
import ModalCleanThread from './ThreadLeftPanel/ModalCleanThread'
import ModalDeleteThread from './ThreadLeftPanel/ModalDeleteThread'
import ModalEditTitleThread from './ThreadLeftPanel/ModalEditTitleThread'
import ThreadRightPanel from './ThreadRightPanel'

import { extensionManager } from '@/extension'
import { downloadedModelsAtom } from '@/helpers/atoms/Model.atom'
import { threadsAtom } from '@/helpers/atoms/Thread.atom'

const ThreadScreen = () => {
  const downloadedModels = useAtomValue(downloadedModelsAtom)
  const threads = useAtomValue(threadsAtom)

  const isDownloadALocalModel = downloadedModels.some((x) =>
    localEngines.includes(x.engine)
  )

  const [extensionHasSettings, setExtensionHasSettings] = useState<
    { name?: string; setting: string; apiKey: string; provider: string }[]
  >([])

  useEffect(() => {
    const getAllSettings = async () => {
      const extensionsMenu: {
        name?: string
        setting: string
        apiKey: string
        provider: string
      }[] = []
      const extensions = extensionManager.getAll()

      for (const extension of extensions) {
        if (typeof extension.getSettings === 'function') {
          const settings = await extension.getSettings()

          if (
            (settings && settings.length > 0) ||
            (await extension.installationState()) !== 'NotRequired'
          ) {
            extensionsMenu.push({
              name: extension.productName,
              setting: extension.name,
              apiKey:
                'apiKey' in extension && typeof extension.apiKey === 'string'
                  ? extension.apiKey
                  : '',
              provider:
                'provider' in extension &&
                typeof extension.provider === 'string'
                  ? extension.provider
                  : '',
            })
          }
        }
      }
      setExtensionHasSettings(extensionsMenu)
    }
    getAllSettings()
  }, [])

  const isAnyRemoteModelConfigured = extensionHasSettings.some(
    (x) => x.apiKey.length > 1
  )

  return (
    <div className="relative flex h-full w-full flex-1 overflow-x-hidden">
      {!isAnyRemoteModelConfigured &&
      !isDownloadALocalModel &&
      !threads.length ? (
        <>
          <OnDeviceStarterScreen extensionHasSettings={extensionHasSettings} />
        </>
      ) : (
        <>
          <ThreadLeftPanel />
          <ThreadCenterPanel />
          <ThreadRightPanel />
        </>
      )}

      {/* Showing variant modal action for thread screen */}
      <ModalEditTitleThread />
      <ModalCleanThread />
      <ModalDeleteThread />
    </div>
  )
}

export default ThreadScreen
