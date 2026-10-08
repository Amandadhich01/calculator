"""
CalcPro — Advanced Python Scientific Calculator (Tkinter GUI)
Developed by Aman Dadhich
"""

import tkinter as tk
from tkinter import ttk, messagebox
import math

class AdvancedCalculator:
    def __init__(self, root):
        self.root = root
        self.root.title("CalcPro — Advanced Scientific Calculator")
        self.root.geometry("420x580")
        self.root.resizable(False, False)
        self.root.configure(bg="#0f172a")

        self.expression = ""
        self.is_deg = True

        # Custom Styling
        self.style = ttk.Style()
        self.style.theme_use('clam')

        self.create_ui()

    def create_ui(self):
        # Top Title & Angle Mode indicator
        top_frame = tk.Frame(self.root, bg="#0f172a")
        top_frame.pack(fill="x", padx=16, pady=(14, 6))

        title_lbl = tk.Label(top_frame, text="🧮 CalcPro Scientific", font=("Segoe UI", 12, "bold"), bg="#0f172a", fg="#f8fafc")
        title_lbl.pack(side="left")

        self.angle_btn = tk.Button(top_frame, text="DEG", font=("Segoe UI", 9, "bold"), bg="#4f46e5", fg="#ffffff",
                                   activebackground="#6366f1", activeforeground="#ffffff", relief="flat", padx=8, pady=2,
                                   command=self.toggle_angle)
        self.angle_btn.pack(side="right")

        # Display Frame
        display_frame = tk.Frame(self.root, bg="#1e293b", bd=2, relief="flat", highlightthickness=1, highlightbackground="#334155")
        display_frame.pack(fill="x", padx=16, pady=8)

        self.history_lbl = tk.Label(display_frame, text="", font=("JetBrains Mono", 10), bg="#1e293b", fg="#94a3b8", anchor="e")
        self.history_lbl.pack(fill="x", padx=12, pady=(8, 2))

        self.display = tk.Entry(display_frame, font=("JetBrains Mono", 22, "bold"), bg="#1e293b", fg="#f8fafc",
                                justify="right", bd=0, relief="flat", insertbackground="#f8fafc")
        self.display.pack(fill="x", padx=12, pady=(2, 10))
        self.display.insert(0, "0")

        # Buttons Grid Frame
        btn_frame = tk.Frame(self.root, bg="#0f172a")
        btn_frame.pack(fill="both", expand=True, padx=16, pady=(6, 16))

        # Scientific & Standard Buttons Layout (6 rows x 5 columns)
        buttons = [
            # Row 0 (Scientific Functions)
            [('sin', self.btn_sin, '#1e293b', '#38bdf8'), ('cos', self.btn_cos, '#1e293b', '#38bdf8'), ('tan', self.btn_tan, '#1e293b', '#38bdf8'), ('π', lambda: self.press('3.14159265'), '#1e293b', '#38bdf8'), ('e', lambda: self.press('2.71828182'), '#1e293b', '#38bdf8')],
            # Row 1
            [('√x', self.btn_sqrt, '#1e293b', '#38bdf8'), ('x²', self.btn_sq, '#1e293b', '#38bdf8'), ('log', self.btn_log, '#1e293b', '#38bdf8'), ('ln', self.btn_ln, '#1e293b', '#38bdf8'), ('n!', self.btn_fact, '#1e293b', '#38bdf8')],
            # Row 2
            [('AC', self.clear_all, '#dc2626', '#ffffff'), ('⌫', self.backspace, '#334155', '#f8fafc'), ('(', lambda: self.press('('), '#1e293b', '#a5b4fc'), (')', lambda: self.press(')'), '#1e293b', '#a5b4fc'), ('÷', lambda: self.press('/'), '#4f46e5', '#ffffff')],
            # Row 3
            [('7', lambda: self.press('7'), '#1e293b', '#f8fafc'), ('8', lambda: self.press('8'), '#1e293b', '#f8fafc'), ('9', lambda: self.press('9'), '#1e293b', '#f8fafc'), ('%', self.btn_percent, '#1e293b', '#a5b4fc'), ('×', lambda: self.press('*'), '#4f46e5', '#ffffff')],
            # Row 4
            [('4', lambda: self.press('4'), '#1e293b', '#f8fafc'), ('5', lambda: self.press('5'), '#1e293b', '#f8fafc'), ('6', lambda: self.press('6'), '#1e293b', '#f8fafc'), ('^', lambda: self.press('**'), '#1e293b', '#a5b4fc'), ('−', lambda: self.press('-'), '#4f46e5', '#ffffff')],
            # Row 5
            [('1', lambda: self.press('1'), '#1e293b', '#f8fafc'), ('2', lambda: self.press('2'), '#1e293b', '#f8fafc'), ('3', lambda: self.press('3'), '#1e293b', '#f8fafc'), ('1/x', self.btn_inv, '#1e293b', '#a5b4fc'), ('+', lambda: self.press('+'), '#4f46e5', '#ffffff')],
            # Row 6
            [('0', lambda: self.press('0'), '#1e293b', '#f8fafc'), ('.', lambda: self.press('.'), '#1e293b', '#f8fafc'), ('±', self.toggle_sign, '#1e293b', '#f8fafc'), ('=', self.calculate, '#10b981', '#ffffff'), ('=', self.calculate, '#10b981', '#ffffff')]
        ]

        for r in range(7):
            btn_frame.rowconfigure(r, weight=1)
        for c in range(5):
            btn_frame.columnconfigure(c, weight=1)

        for r, row in enumerate(buttons):
            for c, btn_tuple in enumerate(row):
                text, cmd, bg_col, fg_col = btn_tuple
                if r == 6 and c == 3:
                    # '=' spans 2 columns
                    b = tk.Button(btn_frame, text="=", font=("Segoe UI", 14, "bold"), bg="#10b981", fg="#ffffff",
                                  activebackground="#059669", activeforeground="#ffffff", relief="flat", bd=0, command=self.calculate)
                    b.grid(row=r, column=3, columnspan=2, sticky="nsew", padx=3, pady=3)
                    break
                else:
                    b = tk.Button(btn_frame, text=text, font=("Segoe UI", 11, "bold"), bg=bg_col, fg=fg_col,
                                  activebackground="#475569", activeforeground="#ffffff", relief="flat", bd=0, command=cmd)
                    b.grid(row=r, column=c, sticky="nsew", padx=3, pady=3)

        # Bind keyboard events
        self.root.bind("<Return>", lambda e: self.calculate())
        self.root.bind("<BackSpace>", lambda e: self.backspace())
        self.root.bind("<Escape>", lambda e: self.clear_all())

    def toggle_angle(self):
        self.is_deg = not self.is_deg
        self.angle_btn.config(text="DEG" if self.is_deg else "RAD")

    def press(self, val):
        current = self.display.get()
        if current == "0" or current == "Error":
            self.display.delete(0, tk.END)
            self.display.insert(tk.END, str(val))
        else:
            self.display.insert(tk.END, str(val))

    def clear_all(self):
        self.display.delete(0, tk.END)
        self.display.insert(0, "0")
        self.history_lbl.config(text="")

    def backspace(self):
        current = self.display.get()
        if len(current) > 1 and current != "0":
            self.display.delete(len(current) - 1, tk.END)
        else:
            self.display.delete(0, tk.END)
            self.display.insert(0, "0")

    def toggle_sign(self):
        try:
            val = float(self.display.get())
            self.display.delete(0, tk.END)
            self.display.insert(0, str(-val if val != int(val) else -int(val)))
        except:
            pass

    def btn_percent(self):
        try:
            val = float(self.display.get()) / 100
            self.display.delete(0, tk.END)
            self.display.insert(0, str(val))
        except:
            pass

    def btn_sin(self):
        self.eval_fn(lambda x: math.sin(math.radians(x) if self.is_deg else x), "sin")

    def btn_cos(self):
        self.eval_fn(lambda x: math.cos(math.radians(x) if self.is_deg else x), "cos")

    def btn_tan(self):
        self.eval_fn(lambda x: math.tan(math.radians(x) if self.is_deg else x), "tan")

    def btn_sqrt(self):
        self.eval_fn(lambda x: math.sqrt(x), "√")

    def btn_sq(self):
        self.eval_fn(lambda x: x ** 2, "sq")

    def btn_log(self):
        self.eval_fn(lambda x: math.log10(x), "log")

    def btn_ln(self):
        self.eval_fn(lambda x: math.log(x), "ln")

    def btn_inv(self):
        self.eval_fn(lambda x: 1 / x, "1/x")

    def btn_fact(self):
        try:
            val = int(float(self.display.get()))
            if 0 <= val <= 100:
                res = math.factorial(val)
                self.history_lbl.config(text=f"{val}!")
                self.display.delete(0, tk.END)
                self.display.insert(0, str(res))
            else:
                self.display.delete(0, tk.END)
                self.display.insert(0, "Error")
        except:
            self.display.delete(0, tk.END)
            self.display.insert(0, "Error")

    def eval_fn(self, fn, name):
        try:
            val = float(self.display.get())
            res = fn(val)
            self.history_lbl.config(text=f"{name}({val})")
            formatted = f"{res:.8f}".rstrip('0').rstrip('.') if isinstance(res, float) else str(res)
            self.display.delete(0, tk.END)
            self.display.insert(0, formatted)
        except:
            self.display.delete(0, tk.END)
            self.display.insert(0, "Error")

    def calculate(self):
        try:
            expr = self.display.get()
            self.history_lbl.config(text=expr + " =")
            # Safe evaluation
            result = eval(expr, {"__builtins__": None, "math": math}, {})
            if isinstance(result, float):
                formatted = f"{result:.10f}".rstrip('0').rstrip('.')
            else:
                formatted = str(result)
            self.display.delete(0, tk.END)
            self.display.insert(0, formatted)
        except ZeroDivisionError:
            self.display.delete(0, tk.END)
            self.display.insert(0, "Cannot divide by 0")
        except Exception:
            self.display.delete(0, tk.END)
            self.display.insert(0, "Error")

if __name__ == "__main__":
    root = tk.Tk()
    app = AdvancedCalculator(root)
    root.mainloop()
