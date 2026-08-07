const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldFormFields = `                                        <input
                                          type="text"
                                          name="numeroConta1"
                                          placeholder="Número da Conta"
                                          value={formData.numeroConta1 || ''}
                                          onChange={handleChange}
                                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                                        />
                                      </div>`;

const newFormFields = `                                        <input
                                          type="text"
                                          name="numeroConta1"
                                          placeholder="Número da Conta"
                                          value={formData.numeroConta1 || ''}
                                          onChange={handleChange}
                                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                                        />
                                        <input
                                          type="text"
                                          name="chavePix"
                                          placeholder="Chave PIX"
                                          value={formData.chavePix || ''}
                                          onChange={handleChange}
                                          className="w-full sm:col-span-3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                                        />
                                      </div>`;

content = content.replace(oldFormFields, newFormFields);
fs.writeFileSync('src/App.tsx', content);
