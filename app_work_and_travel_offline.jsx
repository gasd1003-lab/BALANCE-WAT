{/* HISTORIAL ACTUALIZADO CON FECHAS */}
        <section className="w-full pb-12">
          <h3 className="text-slate-600 font-bold text-xs uppercase mb-4 px-2 tracking-widest">Historial de Movimientos</h3>
          <div className="space-y-3">
            {history.slice(0, 15).map((item, i) => (
              <div key={i} className="bg-slate-800/20 p-4 rounded-2xl flex justify-between items-center border border-slate-800/50 backdrop-blur-sm">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-200">
                    {item.category || item.type}
                  </span>
                  {/* AQUÍ ESTÁ LA FECHA REINCORPORADA */}
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {item.date || new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <div className={`font-mono font-bold text-base ${item.type === 'Ingreso' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.type === 'Ingreso' ? '+' : '-'}${formatMoney(item.value)}
                  </div>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-center text-slate-600 text-xs py-10 italic">No hay registros todavía</p>
            )}
          </div>
        </section>
