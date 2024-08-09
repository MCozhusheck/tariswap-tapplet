/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react"
import { Box, Button, Paper, Typography } from "@mui/material"
import {
  TariPermissions,
  TariUniverseProvider,
  TariUniverseProviderParameters,
  permissions as walletPermissions,
} from "@tariproject/tarijs"
import {
  FIRST_TOKEN_RESOURCE_ADDRESS,
  LP_TOKEN_RESOURCE_ADDRESS,
  PoolResources,
  SECOND_TOKEN_RESOURCE_ADDRESS,
  addLiquidity,
  createPool,
  getPoolBalances,
  getPoolLPToken,
  removeLiquidity,
  swap,
} from "./tariswap"
import { getAccountBalances } from "./wallet"
import { ExitPool, JoinPool, Swap } from "./Components"

const { TariPermissionAccountInfo, TariPermissionKeyList, TariPermissionSubstatesRead, TariPermissionTransactionSend } =
  walletPermissions

const permissions = new TariPermissions()
permissions.addPermission(new TariPermissionKeyList())
permissions.addPermission(new TariPermissionAccountInfo())
permissions.addPermission(new TariPermissionTransactionSend())
permissions.addPermission(new TariPermissionSubstatesRead())
const optionalPermissions = new TariPermissions()
const params: TariUniverseProviderParameters = {
  permissions: permissions,
  optionalPermissions,
}

type TokenBalances = {
  [key: string]: number
}

const defaultTokenBalances: TokenBalances = {
  [FIRST_TOKEN_RESOURCE_ADDRESS]: 0,
  [SECOND_TOKEN_RESOURCE_ADDRESS]: 0,
  [LP_TOKEN_RESOURCE_ADDRESS]: 0,
}

function App() {
  const provider = useRef<TariUniverseProvider>(new TariUniverseProvider(params))
  const [poolState, setPoolState] = useState<PoolResources>({})
  const [lpToken, setLpToken] = useState<any>({})
  const [tokenBalances, setTokenBalances] = useState<TokenBalances>(defaultTokenBalances)

  useEffect(() => {
    refreshState()
  }, [])

  const getPoolState = async () => {
    const poolBalances = await getPoolBalances(provider.current)
    setPoolState(poolBalances)
  }

  const getLPToken = async () => {
    const lpToken = await getPoolLPToken(provider.current)
    setLpToken(lpToken)
  }

  const fetchTokenBalances = async () => {
    const balances = await getAccountBalances(provider.current)
    setTokenBalances(balances)
  }

  const refreshState = async () => {
    getPoolState()
    getLPToken()
    fetchTokenBalances()
  }

  const handleSwap = async (inputToken: string, tokenAmount: number, outputToken: string): Promise<void> => {
    swap(provider.current, inputToken, tokenAmount, outputToken)
  }

  const handleJoinPool = async (firstTokenAmount: number, secondTokenAmount: number): Promise<void> => {
    await addLiquidity(provider.current, firstTokenAmount, secondTokenAmount)
  }
  const handleExitPool = async (lpTokenAmount: number): Promise<void> => {
    await removeLiquidity(provider.current, lpTokenAmount)
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" gap={6} flexDirection="column">
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Paper variant="outlined" elevation={0} sx={{ padding: 4, margin: 3, borderRadius: 4 }}>
          <Typography variant="h6" textAlign="center">
            Pool state
          </Typography>
          <Typography>Pool token A balance: {poolState[FIRST_TOKEN_RESOURCE_ADDRESS]}</Typography>
          <Typography>Pool token A balance: {poolState[SECOND_TOKEN_RESOURCE_ADDRESS]}</Typography>
          <Typography>LP token total supply: {lpToken.total_supply}</Typography>
        </Paper>
        <Paper variant="outlined" elevation={0} sx={{ padding: 4, margin: 3, borderRadius: 4 }}>
          <Typography variant="h6" textAlign="center">
            Your balances
          </Typography>
          <Typography>Your token A balance: {tokenBalances[FIRST_TOKEN_RESOURCE_ADDRESS]}</Typography>
          <Typography>Your token A balance: {tokenBalances[SECOND_TOKEN_RESOURCE_ADDRESS]}</Typography>
          <Typography>Your LP token balance: {tokenBalances[LP_TOKEN_RESOURCE_ADDRESS]}</Typography>
        </Paper>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center" width="100%" height="100%" gap={4} flexGrow={1}>
        <JoinPool onSubmit={handleJoinPool} callback={refreshState} />
        <ExitPool onSubmit={handleExitPool} callback={refreshState} />
        <Swap handleSwap={handleSwap} callback={refreshState} />
      </Box>
      <Button onClick={() => createPool(provider.current)} variant="contained">
        Create new pool
      </Button>
    </Box>
  )
}

export default App
