import { SubmitTransactionRequest, TariUniverseProvider } from "@tariproject/tarijs"
import { TransactionStatus } from "@tariproject/tarijs"
import { FIRST_TOKEN_RESOURCE_ADDRESS, LP_TOKEN_RESOURCE_ADDRESS, SECOND_TOKEN_RESOURCE_ADDRESS } from "./tariswap"

export async function submitAndWaitForTransaction(provider: TariUniverseProvider, req: SubmitTransactionRequest) {
  try {
    const resp = await provider.submitTransaction(req)
    const result = await waitForTransactionResult(provider, resp.transaction_id)

    return result
  } catch (e) {
    console.log(e)
  }
}

export async function waitForTransactionResult(provider: TariUniverseProvider, transactionId: string) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const resp = await provider.getTransactionResult(transactionId)
    const FINALIZED_STATUSES = [
      TransactionStatus.Accepted,
      TransactionStatus.Rejected,
      TransactionStatus.InvalidTransaction,
      TransactionStatus.OnlyFeeAccepted,
      TransactionStatus.DryRun,
    ]

    if (resp.status == TransactionStatus.Rejected) {
      throw new Error(`Transaction rejected: ${JSON.stringify(resp.result)}`)
    }
    if (FINALIZED_STATUSES.includes(resp.status)) {
      return resp
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}

export async function getSubstate(provider: TariUniverseProvider, substateId: string) {
  const resp = await provider.getSubstate(substateId)
  return resp
}

export async function getAccountBalances(provider: TariUniverseProvider) {
  try {
    const account = await provider.getAccount()

    const accountBalances = await provider.getAccountBalances(account.address)
    const firstTokenBalance =
      accountBalances.balances.find(
        (balance) => balance.resource_address.toLowerCase() === FIRST_TOKEN_RESOURCE_ADDRESS.toLocaleLowerCase()
      )?.balance || 0
    const secondTokenBalance =
      accountBalances.balances.find(
        (balance) => balance.resource_address.toLowerCase() === SECOND_TOKEN_RESOURCE_ADDRESS.toLocaleLowerCase()
      )?.balance || 0
    const lpTokenBalance =
      accountBalances.balances.find(
        (balance) => balance.resource_address.toLowerCase() === LP_TOKEN_RESOURCE_ADDRESS.toLocaleLowerCase()
      )?.balance || 0
    return {
      [FIRST_TOKEN_RESOURCE_ADDRESS]: firstTokenBalance,
      [SECOND_TOKEN_RESOURCE_ADDRESS]: secondTokenBalance,
      [LP_TOKEN_RESOURCE_ADDRESS]: lpTokenBalance,
    }
  } catch (e) {
    console.error(e)
    return {
      [FIRST_TOKEN_RESOURCE_ADDRESS]: 0,
      [SECOND_TOKEN_RESOURCE_ADDRESS]: 0,
      [LP_TOKEN_RESOURCE_ADDRESS]: 0,
    }
  }
}
