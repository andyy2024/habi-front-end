**01 Las decisiones clave y por qué las tomaste.**
-	Hice el front en React sobre Vite y el back en Nestjs con prisma porque los conozco muy bien y he trabajado mucho con ellos, así que fue una decisión mas de acelerar el proceso, no tanto de arquitectura.
-	Decidí hacer una base de datos relacional. Como el enunciado decía no se podía perder ni un solo peso, pues se me ocurrió inmediatamente que debía ser una base transaccional, así nadie pierde plata porque garantizamos consistencia. La base de datos esta desplegada en Neon con PostgreSQL.
-	También, el balance se guarda como el tipo de data Decimal y no Float para evitar errores de redondeo, eso es clave también para no perder plata
-	Desplegué todo en Vercel porque es super fácil y siempre lo uso para todos los trabajos de mi universidad.

 
**Cómo sabes que tu sistema no pierde un peso: qué puede salir mal, cómo lo proteges y qué**


Como ya mencioné, esto ocurre porque usamos una base transaccional:
-	Si ocurre un error, se hace rollback
-	Si dos personas hacen la misma transacción al tiempo, hacen una cola y solo pasa una.
No alcance a hacer tests, pero pues por la arquitectura si se garantiza.

**03 Qué dejaste fuera y por qué.**

La verdad siento que nada, puedo equivocarme

**04 Qué harías distinto con más tiempo**.


Implementaría el back-end de la nueva feature, ya que solo funciona en el front-end

**05 Qué NO sabes. Sí, en serio, queremos saberlo.**


No estoy muy seguro de si implementé bien la lógica de las transacciones, si la hice muy simple o si de plano esta mal. Tampoco estoy seguro si había que implementar un back-end.

**06 Los supuestos que hiciste y por qué.**


Supuse que teníamos que implementar toda la lógica desplegada, que tenia que implementar un back-end y que debía asumir que no era una app final para un cliente, sino un dashboard, así que lo hice tal cual (ósea no se inicia sesión ni nada parecido).


**07 Cómo usaste IA:** 


Use antigravity con Gemini Pro en modo High dentro de Vscode. Yo uso los agentes para darle instrucciones muy especificas de que tiene que hacer, porque me ah pasado mucho que los agentes toman decisiones sin preguntarme y luego queda un chorrero de código inmantenible y que aparte no es lo que yo pedí. Tambien me ayudo bastante en los errores de despliegue 

**08 Qué aprendiste: qué es nuevo para ti, qué te sorprendió, qué te llevas.**


Jamás había modelado pagos y transacciones, en la universidad he hecho muchos proyectos pero ninguno de bancos, entonces fue divertido y me enseño un poco de como hacerlo.
