import React, { useEffect, useState } from 'react';
import { api } from './api';
import type { User, Transaction } from './types';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [balance, setBalance] = useState<number | string>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Forms
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  
  const [depositAmount, setDepositAmount] = useState('');
  
  const [transferAmount, setTransferAmount] = useState('');
  const [transferReceiverAccountId, setTransferReceiverAccountId] = useState('');
  const [transferDesc, setTransferDesc] = useState('');
  
  // Split Bill Feature State
  const [selectedTxForSplit, setSelectedTxForSplit] = useState<Transaction | null>(null);
  const [splitWithUserIds, setSplitWithUserIds] = useState<string[]>([]);
  const [splitSuccessMsg, setSplitSuccessMsg] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (e: any) {
      setError(e.message || 'Error fetching users');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUserData = async (accountId: string) => {
    try {
      const balRes = await api.getBalance(accountId);
      setBalance(balRes.balance);
      const txRes = await api.getTransactions(accountId);
      setTransactions(txRes);
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    const accountId = currentUser?.account?.id || currentUser?.id; // Fallback to user id if account is not populated
    if (accountId) {
      loadUserData(accountId);
    } else {
      setBalance(0);
      setTransactions([]);
    }
  }, [currentUser]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const newUser = await api.createUser({ name: newUserName, email: newUserEmail });
      await loadUsers();
      setCurrentUser(newUser);
      setNewUserName('');
      setNewUserEmail('');
    } catch (e: any) {
      setError(e.message || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accountId = currentUser?.account?.id || currentUser?.id;
    if (!accountId) return setError('No account found for current user');
    
    setLoading(true);
    setError('');
    try {
      await api.deposit({ accountId, amount: Number(depositAmount) });
      setDepositAmount('');
      await loadUserData(accountId);
    } catch (e: any) {
      setError(e.message || 'Error depositing');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const senderId = currentUser?.account?.id || currentUser?.id;
    if (!senderId) return setError('No account found for current user');
    
    setLoading(true);
    setError('');
    try {
      await api.transfer({ 
        senderId, 
        receiverId: transferReceiverAccountId, 
        amount: Number(transferAmount),
        description: transferDesc
      });
      setTransferAmount('');
      setTransferDesc('');
      setTransferReceiverAccountId('');
      await loadUserData(senderId);
    } catch (e: any) {
      setError(e.message || 'Error transferring');
    } finally {
      setLoading(false);
    }
  };

  const accountId = currentUser?.account?.id || currentUser?.id;

  return (
    <div className="min-h-screen bg-purple-50 text-gray-800 font-sans p-6 relative">
      
      {/* Split Bill Modal */}
      {selectedTxForSplit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-purple-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-700">Split Bill</h3>
              <button onClick={() => setSelectedTxForSplit(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none">✕</button>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-xl mb-6 text-center border border-purple-100">
              <div className="text-sm text-gray-600 font-medium">Total Transaction Amount</div>
              <div className="text-4xl font-bold text-purple-700 my-1">${Number(selectedTxForSplit.amount).toFixed(2)}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{selectedTxForSplit.description || selectedTxForSplit.type}</div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select friends to split with:</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {users.filter(u => u.id !== currentUser?.id).map(u => (
                  <label key={u.id} className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-purple-50 rounded-xl cursor-pointer border border-gray-100 hover:border-purple-200 transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                      checked={splitWithUserIds.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSplitWithUserIds([...splitWithUserIds, u.id]);
                        } else {
                          setSplitWithUserIds(splitWithUserIds.filter(id => id !== u.id));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-800">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                  </label>
                ))}
                {users.filter(u => u.id !== currentUser?.id).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-gray-100">No other users available to split with.</p>
                )}
              </div>
            </div>

            {splitWithUserIds.length > 0 && (
              <div className="bg-purple-600 text-white p-4 rounded-xl mb-6 flex justify-between items-center shadow-md">
                <span className="text-sm font-medium text-purple-100">Each person pays:</span>
                <span className="font-bold text-2xl">
                  ${(Number(selectedTxForSplit.amount) / (splitWithUserIds.length + 1)).toFixed(2)}
                </span>
              </div>
            )}

            {splitSuccessMsg && (
              <div className="mb-6 p-3 bg-green-100 text-green-800 text-sm rounded-xl text-center font-bold border border-green-200 shadow-sm animate-pulse">
                {splitSuccessMsg}
              </div>
            )}

            <button 
              disabled={splitWithUserIds.length === 0 || !!splitSuccessMsg}
              onClick={() => {
                // Simulate backend split
                setSplitSuccessMsg('Requests sent successfully!');
                setTimeout(() => {
                  setSelectedTxForSplit(null);
                  setSplitSuccessMsg('');
                  setSplitWithUserIds([]);
                }, 1500);
              }}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {splitSuccessMsg ? 'Sent!' : 'Send Split Requests'}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-purple-700 text-white p-6 rounded-2xl shadow-lg">
          <div>
            <h1 className="text-3xl font-bold">Habi Dashboard</h1>
            <p className="text-purple-200 mt-1">Manage your accounts and transactions</p>
          </div>
          <div className="bg-purple-800 p-3 rounded-xl flex items-center space-x-3">
            <label className="font-medium">Active User:</label>
            <select 
              className="bg-purple-900 text-white border-none rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-400 font-medium cursor-pointer"
              value={currentUser?.id || ''}
              onChange={(e) => {
                const u = users.find(x => x.id === e.target.value);
                setCurrentUser(u || null);
              }}
            >
              <option value="">-- Select a user --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
        </header>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl border border-red-200 font-medium shadow-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Create User & Deposit */}
          <div className="space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center space-x-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm">01</span>
                <span>Create Account</span>
              </h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input required type="text" className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input required type="email" className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
                </div>
                <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50">
                  Create User
                </button>
              </form>
            </section>

            {currentUser && (
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center space-x-2">
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm">02</span>
                  <span>Add Balance</span>
                </h2>
                <form onSubmit={handleDeposit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input required min="0.01" step="0.01" type="number" className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
                  </div>
                  <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50">
                    Deposit
                  </button>
                </form>
              </section>
            )}
          </div>

          {/* Middle & Right Column: Balance, Transfer, History */}
          <div className="md:col-span-2 space-y-6">
            
            {!currentUser ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-purple-100 flex flex-col items-center justify-center text-gray-400 h-full">
                <svg className="w-16 h-16 mb-4 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                <p className="text-lg font-medium text-gray-500">Select or create a user to view the dashboard</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Balance Card */}
                  <section className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between transform transition-transform hover:scale-[1.02]">
                    <div>
                      <h2 className="text-purple-200 font-semibold text-lg flex items-center space-x-2">
                        <span className="bg-purple-800/50 text-purple-100 px-2 py-0.5 rounded text-sm">04</span>
                        <span>Current Balance</span>
                      </h2>
                      <div className="text-5xl font-extrabold mt-3 tracking-tight">${Number(balance).toFixed(2)}</div>
                    </div>
                    <div className="mt-8 text-sm text-purple-200 bg-purple-900/30 p-3 rounded-xl backdrop-blur-sm border border-purple-500/30">
                      Account ID: <span className="font-mono ml-1 text-white">{accountId?.slice(0,12)}...</span>
                    </div>
                  </section>

                  {/* Transfer Card */}
                  <section className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center space-x-2">
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm">03</span>
                      <span>Transfer Balance</span>
                    </h2>
                    <form onSubmit={handleTransfer} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Account</label>
                        <select required className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all cursor-pointer" value={transferReceiverAccountId} onChange={e => setTransferReceiverAccountId(e.target.value)}>
                          <option value="">-- Select Recipient --</option>
                          {users.filter(u => u.id !== currentUser.id).map(u => (
                            <option key={u.id} value={u.account?.id || u.id}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                          <input required min="0.01" step="0.01" type="number" className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <input type="text" className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all" value={transferDesc} onChange={e => setTransferDesc(e.target.value)} placeholder="Optional" />
                        </div>
                      </div>
                      <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg transition-colors mt-2 shadow-sm disabled:opacity-50">
                        Send Transfer
                      </button>
                    </form>
                  </section>
                </div>

                {/* History Card */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-bold text-purple-700 mb-6 flex items-center space-x-2">
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm">05</span>
                    <span>Transaction History</span>
                  </h2>
                  {transactions.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-gray-500 font-medium">No transactions found.</p>
                      <p className="text-sm text-gray-400 mt-1">Make a deposit or transfer to see it here.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="border-b-2 border-purple-100 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="pb-3 px-3 font-semibold">Date</th>
                            <th className="pb-3 px-3 font-semibold">Type</th>
                            <th className="pb-3 px-3 font-semibold">Description</th>
                            <th className="pb-3 px-3 font-semibold">Status</th>
                            <th className="pb-3 px-3 font-semibold text-right">Amount</th>
                            <th className="pb-3 px-3 font-semibold text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map(tx => {
                            const isDeposit = tx.type === 'DEPOSIT';
                            const isIncomingTransfer = tx.type === 'TRANSFER' && tx.receiverId === accountId;
                            const isPositive = isDeposit || isIncomingTransfer;
                            
                            return (
                              <tr key={tx.id} className="border-b border-gray-50 hover:bg-purple-50/50 transition-colors group">
                                <td className="py-4 px-3 text-sm text-gray-500 font-medium">
                                  {new Date(tx.createdAt).toLocaleDateString()} <span className="text-gray-400 text-xs ml-1">{new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </td>
                                <td className="py-4 px-3">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${isDeposit ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>
                                    {tx.type}
                                  </span>
                                </td>
                                <td className="py-4 px-3 text-sm text-gray-700 font-medium">
                                  {tx.description || <span className="text-gray-400 italic">None</span>}
                                </td>
                                <td className="py-4 px-3 text-sm">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                    tx.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border border-green-100' :
                                    tx.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                                    'bg-red-50 text-red-700 border border-red-100'
                                  }`}>
                                    {tx.status}
                                  </span>
                                </td>
                                <td className={`py-4 px-3 text-right font-black ${isPositive ? 'text-green-600' : 'text-gray-800'}`}>
                                  {isPositive ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                                </td>
                                <td className="py-4 px-3 text-center">
                                  <button 
                                    onClick={() => {
                                      setSelectedTxForSplit(tx);
                                      setSplitWithUserIds([]);
                                      setSplitSuccessMsg('');
                                    }}
                                    className="text-xs bg-purple-100 hover:bg-purple-600 text-purple-700 hover:text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                                  >
                                    Split Bill
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
