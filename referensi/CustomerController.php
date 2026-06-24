<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    // public function index()
    // {
    //     $title = 'Customers';
    //     $isActive = 'customers';
    //     $head = 'admin';
    //     $customers = Customer::withCount('vehicles')
    //         ->latest()
    //         ->get();
        
    //     return view('customer', compact('customers', 'title', 'isActive', 'head'));
    // }

    public function show(Customer $customer)
    {
        $title = 'Detail Customer';
        $isActive = 'customers';
        $head = 'admin';
        
        $customer = $customer->loadCount('vehicles');
        
        $vehicles = Vehicle::where('customer_id', $customer->id)->get();
        
        return view('customers.show', compact('customer', 'vehicles', 'title', 'isActive', 'head'));
    }

    public function edit(Customer $customer)
    {
        return view('customers.edit', [
            'customer' => $customer,
            'title' => 'Edit Customer',
            'isActive' => 'customers',
            'head' => 'admin'
        ]);
    }

    public function index()
    {
        $customers = Customer::withCount('vehicles')
            ->when(request('search'), function($query) {
                $query->where(function($q) {
                    $q->where('username', 'like', '%' . request('search') . '%')
                      ->orWhere('company', 'like', '%' . request('search') . '%')
                      ->orWhere('telp', 'like', '%' . request('search') . '%')
                      ->orWhere('email', 'like', '%' . request('search') . '%');
                });
            })
            ->orderByRaw("CASE 
                WHEN status = 'Active' THEN 2
                ELSE 1 
                END")
            ->orderBy('created_at', 'desc')
            ->get();

        $title = 'Customers';   
        $isActive = 'customers';
        $head = 'admin';
        
        return view('customer', compact('customers', 'title', 'isActive', 'head'));
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);
        
        $validated = $request->validate([
            'username' => 'required|unique:customers,username,'.$id,
            'email' => 'required|email|unique:customers,email,'.$id,
            'telp' => 'required',
            'company' => 'required',
            'sektor' => 'required',
            'provinsi' => 'required',
            'kabupaten' => 'required',
            'kecamatan' => 'required',
            'kelurahan' => 'required',
            'alamat' => 'required',
            'nama' => 'required',
            'jabatan' => 'required',
        ]);

        $customer->update($validated);

        return redirect()
            ->route('customers.show', $customer->username)
            ->with('success-swal', [
                'title' => 'Berhasil!',
                'text' => 'Data customer berhasil diperbarui',
                'icon' => 'success'
            ]);
    }

    public function confirm(Customer $customer)
    {
        // Update status
        $customer->update(['status' => 'Confirmed']);
        
        // Mendapatkan waktu Jakarta
        $time = now()->setTimezone('Asia/Jakarta')->format('H');
        $salam = '';
        
        if ($time >= 3 && $time < 11) {
            $salam = 'Selamat Pagi';
        } elseif ($time >= 11 && $time < 15) {
            $salam = 'Selamat Siang';
        } elseif ($time >= 15 && $time < 18) {
            $salam = 'Selamat Sore';
        } else {
            $salam = 'Selamat Malam';
        }
        
        // Format pesan WhatsApp
        $message = "{$salam},\n\n";
        $message .= "Terima kasih telah mendaftar di layanan GPS Runner melalui Mitsubishi FUSO Bintaro.\n\n";
        $message .= "Dengan ini kami konfirmasi bahwa kami telah menerima data pendaftaran untuk aktivasi GPS Runner atas nama:\n";
        $message .= "Nama: *{$customer->nama}*\n";
        $message .= "Perusahaan: *{$customer->company}*\n\n";
        $message .= "Untuk melanjutkan proses aktivasi, mohon konfirmasi bahwa alamat email *{$customer->email}* adalah benar aktif dan dapat diakses.\n\n";
        $message .= "_*Mohon balas pesan ini untuk konfirmasi dan melanjutkan proses aktivasi._\n\n";
        $message .= "Terima kasih atas perhatian Bapak/Ibu.\n\n";
        $message .= "Hormat kami,\n";
        $message .= "*Mitsubishi Bintaro*";
        
        // Redirect ke WhatsApp
        return redirect()->away("https://wa.me/62{$customer->telp}?text=" . urlencode($message));
    }

    public function active(Customer $customer)
    {
        // Update status
        $customer->update(['status' => 'Active']);
        
        // Mendapatkan waktu Jakarta
        $time = now()->setTimezone('Asia/Jakarta')->format('H');
        $salam = '';
        
        if ($time >= 3 && $time < 11) {
            $salam = 'Selamat Pagi';
        } elseif ($time >= 11 && $time < 15) {
            $salam = 'Selamat Siang';
        } elseif ($time >= 15 && $time < 18) {
            $salam = 'Selamat Sore';
        } else {
            $salam = 'Selamat Malam';
        }
        
        // Format pesan WhatsApp
        $message = "{$salam} Bapak/Ibu {$customer->nama},\n\n";
        $message .= "Kami ingin menginformasikan bahwa akun Bapak/Ibu telah berhasil kami daftarkan. ";
        $message .= "Mohon untuk membuka email dari *KTB-Fuso*, kemudian klik *Disclaimer Activation* untuk menyetujui pengaktifan akun.\n\n";
        $message .= "Adapun *password sementara* untuk login terdapat pada email tersebut. ";
        $message .= "Setelah menyetujui Disclaimer Activation, Bapak/Ibu dapat login melalui aplikasi atau web dengan:\n";
        $message .= "- *Username*: {$customer->username}\n";
        $message .= "- *Password sementara*: (terdapat di email)\n\n";
        $message .= "Setelah berhasil login, mohon segera mengganti password Bapak/Ibu demi keamanan akun.\n\n";
        $message .= "Berikut tautan untuk mengakses aplikasi:\n";
        $message .= "- *Link Aplikasi (PlayStore)*: https://play.google.com/store/apps/details?id=id.co.ktbfuso.runner\n";
        $message .= "- *Link Web Browser*: http://runner.ktbfuso.co.id/\n\n";
        $message .= "_*Sebagai referensi, contoh email terlampir._\n\n";
        $message .= "Terima kasih atas perhatian dan kerjasamanya.";
        
        // Redirect ke WhatsApp
        return redirect()->away("https://wa.me/62{$customer->telp}?text=" . urlencode($message));
    }

    public function confirmVehicle(Customer $customer)
    {
        // Mendapatkan dan mengupdate kendaraan dengan status New menjadi Active
        $pendingVehicles = Vehicle::where('customer_id', $customer->id)
            ->where('status', 'New')
            ->get();
            
        // Update status semua kendaraan yang pending menjadi Active
        Vehicle::where('customer_id', $customer->id)
            ->where('status', 'New')
            ->update(['status' => 'Active']);
            
        // Mendapatkan waktu Jakarta
        $time = now()->setTimezone('Asia/Jakarta')->format('H');
        $salam = '';
        
        if ($time >= 3 && $time < 11) {
            $salam = 'Selamat Pagi';
        } elseif ($time >= 11 && $time < 15) {
            $salam = 'Selamat Siang';
        } elseif ($time >= 15 && $time < 18) {
            $salam = 'Selamat Sore';
        } else {
            $salam = 'Selamat Malam';
        }

        $message = "{$salam} Bapak/Ibu {$customer->nama},\n\n";
        $message .= "Berikut detail kendaraan yang akan diaktivasi:\n";
        
        foreach($pendingVehicles as $vehicle) {
            $message .= "- No. Polisi: *{$vehicle->nopol}*\n";
            $message .= "  No. Rangka: *{$vehicle->rangka}*\n\n";
        }
        
        $message .= "\nUnit Bapak/Ibu telah kami bantu aktivasi. Mohon untuk login kembali ke aplikasi dan menyetujui pengaktifan kendaraan dengan memberikan tanda centang (checklist) pada kendaraan yang akan diaktivasi.\n\n";
        $message .= "Setelah itu, mohon menunggu hingga kendaraan terupdate. Proses ini membutuhkan waktu estimasi 2x24 jam, namun dapat selesai lebih cepat.\n\n";
        $message .= "Berikut adalah tautan untuk mengakses aplikasi:\n";
        $message .= "- Aplikasi PlayStore: https://play.google.com/store/apps/details?id=id.co.ktbfuso.runner&hl=id&gl=US\n";
        $message .= "- Web Browser (Safari/Chrome): http://runner.ktbfuso.co.id/\n\n";
        $message .= "Terima kasih atas perhatian dan kerjasamanya.";
        
        return redirect()->away("https://wa.me/62{$customer->telp}?text=" . urlencode($message));
    }

    public function confirmAdd(Customer $customer)
    {
        // Update status
        $customer->update(['status' => 'Active']);
        
        // Mendapatkan waktu Jakarta
        $time = now()->setTimezone('Asia/Jakarta')->format('H');
        $salam = '';
        
        if ($time >= 3 && $time < 11) {
            $salam = 'Selamat Pagi';
        } elseif ($time >= 11 && $time < 15) {
            $salam = 'Selamat Siang';
        } elseif ($time >= 15 && $time < 18) {
            $salam = 'Selamat Sore';
        } else {
            $salam = 'Selamat Malam';
        }
        
        // Mengambil kendaraan yang belum dikonfirmasi
        $pendingVehicles = Vehicle::where('customer_id', $customer->id)
            ->where('status', 'New')
            ->get();
            
        $message = "{$salam} Bapak/Ibu {$customer->nama},\n\n";
        $message .= "Terima kasih telah mengirimkan permintaan penambahan kendaraan pada layanan GPS Runner.\n\n";
        $message .= "Berikut detail kendaraan yang akan ditambahkan:\n";
        
        foreach($pendingVehicles as $vehicle) {
            $message .= "- No. Polisi: *{$vehicle->nopol}*\n";
            $message .= "  No. Rangka: *{$vehicle->rangka}*\n\n";
        }
        
        $message .= "\nDengan ini kami informasikan bahwa permintaan Bapak/Ibu telah kami terima dan akan segera kami proses.\n";
        $message .= "Mohon menunggu informasi selanjutnya dari tim kami.\n\n";
        $message .= "Terima kasih atas perhatian dan kerjasamanya.";
        
        return redirect()->away("https://wa.me/62{$customer->telp}?text=" . urlencode($message));
    }
    
    public function fuEngagemen(Customer $customer)
    {
        // Hitung jumlah kendaraan customer
        $jumlahKendaraan = Vehicle::where('customer_id', $customer->id)->count();
    
        // Ambil nama dan company
        $nama = $customer->nama;
        $company = $customer->company;
        $username = $customer->username;
    
        // Waktu salam default "Selamat Siang" sesuai instruksi
        $salam = "Selamat Siang";
    
        // Susun pesan
        $message  = "{$salam} Bapak/Ibu {$nama} {$company},\n\n";
        $message .= "Kami dari *Mitsubishi Fuso Bintaro* ingin mengingatkan Anda untuk membuka akun *GPS Runner* Anda secara rutin.\n\n";
        $message .= "Dengan memastikan *GPS pada kendaraan* Bapak/Ibu selalu dalam keadaan terupdate, Anda bisa menjaga agar tidak ada masalah yang muncul.\n\n";
        $message .= "Ingat, *{$jumlahKendaraan} kendaraan* Bapak/Ibu adalah aset yang sangat berharga!\n";
        $message .= "Jika ada kendaraan Anda **Not Update / Tidak Aktif* kami bisa membantu Anda.\n\n";
        $message .= "Anda bisa Login menggunakan Username : *{$username}*\n\n";
        $message .= "Jika Anda mengalami kesulitan dalam mengakses aplikasi atau lupa password, jangan ragu untuk menghubungi kami. *Kami siap membantu Anda!*\n\n";
        $message .= "Info selengkapnya\n";
        $message .= "https://www.ktbfuso.co.id/service/telematics/\n\n";
        $message .= "Salam hangat,\n";
        $message .= "*Mitsubishi Fuso Bintaro*";
    
        // Redirect ke WhatsApp
        return redirect()->away("https://wa.me/62{$customer->telp}?text=" . urlencode($message));
    }


    public function destroy($username)
    {
        $customer = Customer::where('username', $username)->firstOrFail();
        $customer->delete();
        
        return redirect()
            ->route('customers.index')
            ->with('success-swal', [
                'title' => 'Berhasil!',
                'text' => "Customer {$customer->company} berhasil dihapus!",
                'icon' => 'success',
            ]);
    }

    public function other(Customer $customer)
    {
        $customer->update(['status' => 'Other']);
        
        return redirect()->back()->with('success', 'Status customer berhasil diubah menjadi Other');
    }
} 
