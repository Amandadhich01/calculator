import tkinter as tk

def press(num):
    expression_field.insert(tk.END, str(num))

def equalpress():
    try:
        result = eval(expression_field.get())
        expression_field.delete(0, tk.END)
        expression_field.insert(0, str(result))
    except:
        expression_field.delete(0, tk.END)
        expression_field.insert(0, "Error")

def clear():
    expression_field.delete(0, tk.END)
    
root = tk.Tk()
root.title("Python Calculator")
root.geometry("300x400")
root.resizable(False, False)

expression_field = tk.Entry(root, font=('Arial', 20), bd=10, insertwidth=2, width=14, borderwidth=4)
expression_field.grid(row=0, column=0, columnspan=4)

buttons = [
    ('7', 1, 0), ('8', 1, 1), ('9', 1, 2), ('/', 1, 3),
    ('4', 2, 0), ('5', 2, 1), ('6', 2, 2), ('*', 2, 3),
    ('1', 3, 0), ('2', 3, 1), ('3', 3, 2), ('-', 3, 3),
    ('0', 4, 0), ('.', 4, 1), ('=', 4, 2), ('+', 4, 3),
]

for (text, row, col) in buttons:
    if text == "=":
        tk.Button(root, text=text, padx=20, pady=20, font=('Arial', 14), bg="lightgreen",
                  command=equalpress).grid(row=row, column=col)
    else:
        tk.Button(root, text=text, padx=20, pady=20, font=('Arial', 14),
                  command=lambda t=text: press(t)).grid(row=row, column=col)

tk.Button(root, text='C', padx=95, pady=20, font=('Arial', 14), bg="lightcoral", command=clear).grid(row=5, column=0, columnspan=4)

root.mainloop()
